/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_CONTEXT } from "./context_data.ts";
import { checkAndIncrementQuota } from "./repository.ts";
import { generateResponse } from "./llm.ts";

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
    const { messages, embedding } = await req.json(); // Expecting embedding from client or we generate it here?
    // User request implies strict system instruction, let's assume client sends text messages.
    // Ideally we generate embedding regarding the LAST user message here if we had `transformers.js`
    // Since we can't easily add deps in this environment without `deno.json`, we might skip RAG 
    // OR assuming client sends `embedding` (which isn't secure but works for this constraint).
    // Let's assume for now we just use the SYSTEM_CONTEXT + Chat.

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

    const finalMessages = [systemMessage, ...messages];

    // 5. Call LLM (Stream)
    const responseComp = await generateResponse(finalMessages, isPremium);

    return new Response(responseComp.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
*/
