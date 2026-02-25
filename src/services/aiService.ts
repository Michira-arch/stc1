
import { supabase } from '../../store/supabaseClient';
import { ChatMessage } from '../../types';
import { appRegistry } from '../ai/appRegistry';

export interface AIContext {
    type: 'page' | 'post' | 'selection';
    content: string;
    id?: string;
    imageUrl?: string;
}

const EDGE_FUNCTION_URL = 'https://njzdblwjpuogbjujrxrw.supabase.co/functions/v1/chat-with-ai';

/**
 * Get auth token for API calls.
 */
async function getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Please log in to use AI chat.");
    return token;
}

/**
 * Build enriched page context from the AppRegistry + optional manual context.
 */
async function buildPageContext(context?: AIContext | null): Promise<string> {
    let pageContext = '';

    // Get structured context from the App Registry
    try {
        const registryContext = await appRegistry.getEnrichedContext();
        pageContext += registryContext;
    } catch {
        // Fallback — registry might not be initialized
    }

    // Add manual context (from specific posts, selections, etc.)
    if (context) {
        pageContext += `\n\n--- User Context (${context.type}) ---\n${context.content}`;
    }

    return pageContext;
}

/**
 * Send a message to the AI with streaming response.
 */
export const sendMessageToAI = async (
    messages: ChatMessage[],
    context?: AIContext | null,
    onStream?: (chunk: string) => void
): Promise<string> => {
    try {
        const token = await getAuthToken();
        const pageContext = await buildPageContext(context);

        // Prepare messages with image context if present
        const preparedMessages = [...messages];
        if (context?.imageUrl && preparedMessages.length > 0) {
            const lastMsgIndex = preparedMessages.length - 1;
            const lastMsg = preparedMessages[lastMsgIndex];

            if (lastMsg.role === 'user') {
                const textContent = typeof lastMsg.content === 'string' ? lastMsg.content : '';
                preparedMessages[lastMsgIndex] = {
                    ...lastMsg,
                    content: [
                        { type: "text", text: textContent },
                        { type: "image_url", image_url: { url: context.imageUrl } }
                    ] as any
                };
            }
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                messages: preparedMessages,
                page_context: pageContext,
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to get response");
        }

        if (!response.body) throw new Error("No response body");

        return await processStream(response.body, onStream);

    } catch (error: any) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

/**
 * Confirm and execute a proposed agent action.
 */
export const confirmAgentAction = async (
    toolName: string,
    toolCallId: string,
    params: Record<string, any>,
    onStream?: (chunk: string) => void
): Promise<string> => {
    try {
        const token = await getAuthToken();

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                messages: [],
                confirm_action: {
                    tool_name: toolName,
                    tool_call_id: toolCallId,
                    params,
                },
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Action execution failed");
        }

        if (!response.body) throw new Error("No response body");

        return await processStream(response.body, onStream);

    } catch (error: any) {
        console.error("Action Confirmation Error:", error);
        throw error;
    }
};

/**
 * Process an SSE stream from the edge function.
 */
async function processStream(
    body: ReadableStream,
    onStream?: (chunk: string) => void
): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                    const json = JSON.parse(line.substring(6));
                    const content = json.choices?.[0]?.delta?.content || '';
                    if (content) {
                        fullText += content;
                        if (onStream) onStream(content);
                    }
                } catch {
                    // ignore parse errors
                }
            }
        }
    }

    return fullText;
}
