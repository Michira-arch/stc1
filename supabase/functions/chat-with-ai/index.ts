/*import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildSystemPrompt } from "./context_data.ts";
import { checkAndIncrementQuota, logAgentAction } from "./repository.ts";
import { generateResponse } from "./llm.ts";
import { toolsSchema, executeTool, isWriteTool } from "./tools.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_TOOL_ROUNDS = 3; // Max agentic loop iterations

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // ─── 1. Auth & Setup ───────────────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Invalid User Token');

    // ─── 2. Parse Request ──────────────────────────────────────
    const { messages, page_context, confirm_action } = await req.json();

    // ─── 3. Handle Action Confirmation ─────────────────────────
    // If the frontend is confirming a previously proposed action,
    // execute it directly and return the result.
    if (confirm_action) {
      const { tool_name, tool_call_id, params } = confirm_action;
      console.log(`Confirmed action: ${tool_name} (${tool_call_id})`);

      const result = await executeTool(tool_name, params, supabase, user.id);
      await logAgentAction(supabase, user.id, tool_call_id, tool_name, params, 'executed', JSON.parse(result));

      // Return as a simple streamed response
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const chunk = { choices: [{ delta: { content: `✅ Action completed: ${JSON.parse(result).message || result}` } }] };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    // ─── 4. Check Quota ────────────────────────────────────────
    const { allowed, isPremium, error: quotaError } = await checkAndIncrementQuota(supabase, user.id);
    if (!allowed) {
      return new Response(JSON.stringify({
        error: quotaError || "Quota exceeded",
        fallback: "Model is in high demand, upgrade to AI premium (100 shillings/month) to get uninterrupted AI usage."
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── 5. Build System Prompt ────────────────────────────────
    const systemMessage = {
      role: "system",
      content: buildSystemPrompt(page_context)
    };

    let finalMessages = [systemMessage, ...messages];

    // ─── 6. Agentic Loop ───────────────────────────────────────
    // Multi-step tool chaining: the AI can call tools, get results,
    // and decide to call more tools or generate a final response.

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      // Non-streaming call to check for tool calls
      const toolCheckResponse = await generateResponse(finalMessages, isPremium, toolsSchema, false);
      const responseJson = await toolCheckResponse.json();
      const choice = responseJson.choices?.[0];
      const message = choice?.message;

      if (!message) {
        throw new Error("No response from model");
      }

      // No tool calls → break and generate final streaming response
      if (!message.tool_calls || message.tool_calls.length === 0) {
        // The model returned a text response without tools.
        // Package it as a stream for the frontend.
        const content = message.content || "";
        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            if (content) {
              const chunk = { choices: [{ delta: { content: content } }] };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        });
      }

      // Tool calls detected!
      console.log(`Round ${round + 1}: Agent wants ${message.tool_calls.length} tool(s)`);

      // Append the assistant's tool-call intent
      finalMessages.push(message);

      // Check if any tool is a write action
      const hasWriteAction = message.tool_calls.some(
        (tc: any) => isWriteTool(tc.function.name)
      );

      // Execute read tools immediately; for write tools, also execute
      // (the frontend trust layer already handles confirmation before calling us)
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          args = {};
        }

        console.log(`  → Executing: ${functionName}`, args);
        const result = await executeTool(functionName, args, supabase, user.id);

        // Log the action
        const status = isWriteTool(functionName) ? 'executed' : 'read';
        await logAgentAction(supabase, user.id, toolCall.id, functionName, args, status,
          (() => { try { return JSON.parse(result); } catch { return { raw: result }; } })()
        );

        // Append tool result to messages
        finalMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: result
        });
      }

      // Continue loop — the model will see the tool results and may call more tools
      // or generate a final response
    }

    // If we exhausted all rounds, do one final streaming call without tools
    console.log("Max tool rounds reached, generating final response...");
    const finalResponse = await generateResponse(finalMessages, isPremium, undefined, true);

    return new Response(finalResponse.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error: any) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
*/