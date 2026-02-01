import { supabase } from '../../../../store/supabaseClient';

export const callAI = async (prompt: string, systemPrompt?: string): Promise<string> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) throw new Error("Please log in.");

        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://njzdblwjpuogbjujrxrw.supabase.co/functions/v1/chat-with-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) throw new Error("AI Service unavaiable");

        // Simple stream reader
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
                        } catch (e) { }
                    }
                }
            }
        }
        return fullText || "No response generated.";

    } catch (e) {
        console.error(e);
        return "AI is taking a nap (Error).";
    }
}

export const generateListingDescription = async (title: string, category: string): Promise<string> => {
    const prompt = `Write a short, catchy, and professional description (max 30 words) for a student marketplace listing. 
      Title: "${title}"
      Category: "${category}"
      Tone: Helpful, student-friendly.`;

    return await callAI(prompt, "You are a helpful copywriting assistant.");
};

export const roastResume = async (resumeText: string): Promise<string> => {
    const prompt = `Roast this resume excerpt provided by a college student. 
      Be constructive but very direct about clichés, vague wording, or poor formatting implications. Keep it under 100 words.
      
      Resume Text: "${resumeText}"`;

    return await callAI(prompt, "You are a tough but fair senior recruiter at a top tech company.");
};
