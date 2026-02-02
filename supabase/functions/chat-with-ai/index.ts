/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_CONTEXT } from "./context_data.ts";
import { checkAndIncrementQuota } from "./repository.ts";
import { generateResponse } from "./llm.ts";
import { toolsSchema, executeTool } from "./tools.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS - Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // 1. Auth & Setup
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Invalid User Token');

    // 2. Parse Request
    const { messages } = await req.json();

    // 3. Check Quota
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

    // 4. Construct Prompt with Context
    const systemMessage = {
      role: "system",
      content: `You are a helpful assistant for the Student Center App. Use the following context to answer user questions.

${SYSTEM_CONTEXT}`
    };

    let finalMessages = [systemMessage, ...messages];

    // 5. Agentic Loop (Step 1: Check for Tool Call)
    // We call with stream: false first to see if the model wants to run a tool
    const firstResponse = await generateResponse(finalMessages, isPremium, toolsSchema, false);
    const firstResponseJson = await firstResponse.json();
    const choice = firstResponseJson.choices[0];
    const message = choice.message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      // Tool usage detected!
      console.log("Agent decided to use tools:", message.tool_calls.length);
      
      // Append the assistant's "intent" to messages
      finalMessages.push(message);

      // Execute all tools
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        const result = await executeTool(functionName, args, supabase, user.id);
        
        // Append result as a tool message
        finalMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: result
        });
      }

      // Step 2: Final Answer (Streaming)
      // Now we call LLM again with the tool outputs context
      const secondResponse = await generateResponse(finalMessages, isPremium, toolsSchema, true);
      
      return new Response(secondResponse.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });

    } else {
      // No tool used, just text.
      // Since we already consumed the stream (by doing await firstResponse.json()), 
      // we need to re-package the text as a stream for the frontend.
      
      const content = message.content || "";
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          // Simulate OpenAI/Groq SSE format
          // Send content
          if (content) {
             const chunk = { choices: [{ delta: { content: content } }] };
             controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          // Send DONE
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
*/
