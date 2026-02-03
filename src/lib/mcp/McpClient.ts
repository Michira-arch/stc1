
import { createClient } from "@supabase/supabase-js";
import { ChatMessage, McpRpcResponse, ToolDefinition } from "./schema";

// NOTE: In a production app, never expose the service role key or secret keys.
// The Supabase Client here should be the one from the app context (Anon key).
// For the LLM API Key, use a Proxy or a user-provided key.
// Depending on user preference, we might need a settings page for the API Key.

export class McpClient {
    private supabase;
    private tools: ToolDefinition[] | null = null;
    private apiKey: string | undefined;

    constructor(supabaseUrl: string, supabaseKey: string, groqApiKey?: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.apiKey = groqApiKey;
    }

    setApiKey(key: string) {
        this.apiKey = key;
    }

    async init() {
        // 1. Fetch available tools from the Server
        const { data, error } = await this.supabase.functions.invoke("mcp-server", {
            method: "GET",
        });

        if (error) {
            console.error("Failed to fetch tools manifest:", error);
            throw error;
        }

        if (data && data.tools) {
            this.tools = data.tools;
        }
    }

    async *runAgentLoop(
        messages: ChatMessage[],
        onToolCall?: (toolName: string) => void
    ): AsyncGenerator<string, void, unknown> {
        if (!this.apiKey) {
            yield "Error: Groq API Key is missing. Please check your settings.";
            return;
        }

        if (!this.tools) {
            await this.init();
        }

        let currentMessages = [...messages];
        const MAX_TURNS = 5;
        let turnCount = 0;

        while (turnCount < MAX_TURNS) {
            turnCount++;

            // 1. Call LLM
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192", // Or dynamic model
                    messages: currentMessages,
                    tools: this.tools?.map((t) => ({
                        type: "function",
                        function: {
                            name: t.name,
                            description: t.description,
                            parameters: t.input_schema,
                        },
                    })),
                    tool_choice: "auto",
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                yield `Error calling LLM: ${err}`;
                return;
            }

            const data = await response.json();
            const choice = data.choices[0];
            const message = choice.message;

            // Add assistant message to history
            currentMessages.push(message);

            // 2. Check for Tool Calls
            if (message.tool_calls && message.tool_calls.length > 0) {
                // Yield a status update or let the UI know we are processing

                for (const toolCall of message.tool_calls) {
                    const fnName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);

                    if (onToolCall) onToolCall(fnName);

                    // Execute Tool via Supabase Function (MCP Server)
                    const { data: resultData, error: rpcError } = await this.supabase.functions.invoke("mcp-server", {
                        body: {
                            jsonrpc: "2.0",
                            method: "tools/call",
                            params: {
                                name: fnName,
                                arguments: args
                            },
                            id: toolCall.id
                        }
                    });

                    let content = "Error executing tool";
                    if (rpcError) {
                        content = `Error: ${rpcError.message}`;
                    } else if (resultData.error) {
                        content = `Error: ${resultData.error.message}`;
                    } else if (resultData.result) {
                        // MCP returns content: [{ type: 'text', text: '...' }]
                        content = resultData.result.content[0].text;
                    }

                    // Add Tool Result to history
                    currentMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: fnName,
                        content: content
                    });
                }
                // Loop continues to feed tool outputs back to LLM
            } else {
                // 3. Final Text Response
                if (message.content) {
                    yield message.content;
                }
                return; // We are done
            }
        }
    }
}
