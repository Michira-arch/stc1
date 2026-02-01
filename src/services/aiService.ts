
import { supabase } from '../../store/supabaseClient';
import { ChatMessage } from '../../types';

export interface AIContext {
    type: 'page' | 'post' | 'selection';
    content: string;
    id?: string;
}

export const sendMessageToAI = async (
    messages: ChatMessage[],
    context?: AIContext | null,
    onStream?: (chunk: string) => void
): Promise<string> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) throw new Error("Please log in to use AI chat.");

        // Prepare messages with context
        const contextMessage = context
            ? `\n\n[Current Content Context (${context.type})]:\n${context.content}`
            : '';

        // We append context to the last user message or as a system message?
        // The backend expects specific role structure? likely just openai format.
        // We'll append it to the system instructions if possible, or prepended to the last user message.
        // Since we don't control the system prompt on client easily (it's in Edge Function), 
        // we will prepend it to verify strict adherence.
        // ACTUALLY, the user wants to "add context from what is on the page".

        const preparedMessages = [...messages];
        if (context) {
            // Find the last user message to append context
            // Or add a system message at the end?
            // Adding a system message right before the last user message is usually best.
            preparedMessages.splice(preparedMessages.length - 1, 0, {
                role: 'system',
                content: `Context Information for the user's current view:\n${contextMessage}`
            });
        }

        const response = await fetch('https://njzdblwjpuogbjujrxrw.supabase.co/functions/v1/chat-with-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                messages: preparedMessages
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to get response");
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);

            // Simple stream parsing
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const json = JSON.parse(line.substring(6));
                        const content = json.choices[0]?.delta?.content || '';
                        if (content) {
                            fullText += content;
                            if (onStream) onStream(content);
                        }
                    } catch (e) {
                        // ignore
                    }
                }
            }
        }

        return fullText;

    } catch (error: any) {
        console.error("AI Service Error:", error);
        throw error;
    }
};
