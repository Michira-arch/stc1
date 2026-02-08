import { supabase } from '../../../../store/supabaseClient';
import { AI_SYSTEM_INSTRUCTION } from '../constants';
import { Restaurant } from '../types';

export const generateFoodRecommendation = async (
    userQuery: string,
    restaurants: Restaurant[],
    chatHistory: { role: 'user' | 'assistant', text: string }[] = []
): Promise<string> => {

    // Prepare context about available food from the dynamic state
    const menuContext = JSON.stringify(restaurants.map(r => ({
        restaurant: r.name,
        menu: r.menu?.map(m => ({ name: m.name, desc: m.description, price: `KES ${m.price}`, tags: m.tags })) || []
    })));

    const systemMessage = `${AI_SYSTEM_INSTRUCTION}\n\nContext Data (Available Campus Menus):\n${menuContext}`;

    try {
        const messages = [
            { role: 'system', content: systemMessage },
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.text })),
            { role: 'user', content: userQuery }
        ];

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) throw new Error("Please log in to use AI.");

        const response = await fetch('https://njzdblwjpuogbjujrxrw.supabase.co/functions/v1/chat-with-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to fetch response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const json = JSON.parse(line.substring(6));
                            const content = json.choices[0]?.delta?.content || '';
                            fullText += content;
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            }
        }

        return fullText || "I couldn't generate a recommendation.";

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return `Sorry, I'm currently offline (Error: ${error.message}). Check your connection.`;
    }
};
