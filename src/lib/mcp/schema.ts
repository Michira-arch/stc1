
export interface ToolDefinition {
    name: string;
    description: string;
    input_schema: any;
}

export interface McpRpcResponse {
    jsonrpc: "2.0";
    result?: {
        content: Array<{ type: "text"; text: string }>;
        tools?: ToolDefinition[];
    };
    error?: {
        code: number;
        message: string;
    };
    id: string | number | null;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant" | "tool";
    content?: string | null; // Can be null if tool_calls is present
    name?: string; // For tool outputs
    tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
            name: string;
            arguments: string; // JSON string
        };
    }>;
    tool_call_id?: string; // For tool outputs
}
