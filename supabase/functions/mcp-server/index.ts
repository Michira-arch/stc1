/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { tools } from "./tools.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// -- Minimal MCP-like Server Implementation for Deno/Edge --
// This avoids complex dependency issues by implementing just enough of the protocol
// to work with our custom Client-side logic.

interface JsonRpcRequest {
    jsonrpc: "2.0";
    method: string;
    params?: any;
    id?: string | number;
}

interface JsonRpcResponse {
    jsonrpc: "2.0";
    result?: any;
    error?: { code: number; message: string; data?: any };
    id: string | number | null;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify User
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid User' }), { status: 401, headers: corsHeaders });
        }

        // 1. SSE Endpoint (GET) - For establishing the "Connection" (optional in this HTTP-only RPC model, but good for MCP compat)
        if (req.method === 'GET') {
            // Just return the tools definitions as an initial event or plain JSON for discovery
            // In a full MCP SSE transport, this would keep the connection open.
            // For our Client-Host model, we can probably just return the tools config for the client to use.

            const toolDefinitions = Object.entries(tools).map(([name, tool]) => ({
                name,
                description: tool.description,
                input_schema: tool.parameters
            }));

            return new Response(JSON.stringify({
                type: "tools_manifest",
                tools: toolDefinitions
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 2. RPC Endpoint (POST) - Execute Tools
        if (req.method === 'POST') {
            const body: JsonRpcRequest = await req.json();

            if (body.method === 'tools/call') {
                const { name, arguments: args } = body.params || {};

                const tool = tools[name as keyof typeof tools];
                if (!tool) {
                    return new Response(JSON.stringify({
                        jsonrpc: "2.0",
                        error: { code: -32601, message: "Method not found" },
                        id: body.id
                    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
                }

                try {
                    const result = await tool.execute(args, { supabase, userId: user.id });
                    return new Response(JSON.stringify({
                        jsonrpc: "2.0",
                        result: { content: [{ type: "text", text: result }] },
                        id: body.id
                    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

                } catch (err: any) {
                    return new Response(JSON.stringify({
                        jsonrpc: "2.0",
                        error: { code: -32000, message: err.message },
                        id: body.id
                    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
                }
            }

            // Handle 'tools/list' if client asks via POST
            if (body.method === 'tools/list') {
                const toolDefinitions = Object.entries(tools).map(([name, tool]) => ({
                    name,
                    description: tool.description,
                    inputSchema: tool.parameters
                }));

                return new Response(JSON.stringify({
                    jsonrpc: "2.0",
                    result: { tools: toolDefinitions },
                    id: body.id
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }

            return new Response(JSON.stringify({ error: "Method not supported" }), { status: 400, headers: corsHeaders });
        }

        return new Response("Not Found", { status: 404, headers: corsHeaders });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
*/