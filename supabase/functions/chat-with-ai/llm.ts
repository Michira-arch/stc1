/*
const getApiKeys = () => {
    const keys = [
        Deno.env.get('GROQ_API_KEY'),
        Deno.env.get('GROQ_API_KEY_2'),
        Deno.env.get('GROQ_API_KEY_3'),
    ].filter((k): k is string => !!k && k.length > 0);
    
    // Fisher-Yates shuffle
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    
    return keys;
};

const executeGroqRequest = async (
    messages: any[],
    model: string,
    apiKey: string,
    stream: boolean = true,
    tools?: any[],
    tool_choice?: any
) => {
    const body: any = {
        model: model,
        messages: messages,
        stream: stream,
        max_tokens: 1024,
        temperature: 0.7
    };

    if (tools) {
        body.tools = tools;
        body.tool_choice = tool_choice || "auto";
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
  }

  return response;
};

export const callGroq = async (
    messages: any[],
    model: string,
    _unusedApiKey?: string, // Kept for signature compatibility if needed, but unused
    stream: boolean = true,
    tools?: any[],
    tool_choice?: any
) => {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error("No GROQ_API_KEY set in environment");

    let lastError: any;

    for (const apiKey of keys) {
        try {
            return await executeGroqRequest(messages, model, apiKey, stream, tools, tool_choice);
        } catch (error) {
            console.error(`API Key ending in ...${apiKey.slice(-4)} failed:`, error);
            lastError = error;
            // Continue to next key
        }
    }

    throw lastError || new Error("All API keys failed");
};

// Fallback Logic
export const generateResponse = async (
  messages: any[],
  isPremium: boolean,
  tools?: any[],
  stream: boolean = true
) => {
  // Check if messages imply vision is needed (e.g. image_url present)
  const isVisionRequest = messages.some(m => 
    Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url')
  );

  let model = "llama-3.1-8b-instant"; // Default (Fast, Cheap)
  
  if (isVisionRequest) {
      if (!isPremium) {
          // Fallback Strategy: Strip images and warn user via model
          // We must remove image_url content so the text model doesn't error
          messages = messages.map((m: any) => {
             if (Array.isArray(m.content)) {
                 // Filter out image_url parts
                 const newContent = m.content.filter((c: any) => c.type !== 'image_url');
                 return { ...m, content: newContent };
             }
             return m;
          });

          // Inject system instruction to warn user
          messages.push({
             role: "system",
             content: "IMPORTANT: The user attached an image but does not have Premium access. You CANNOT see the image. Start your response by explicitly stating: that image analysis is a premium feature for paid users and then proceed to answer their text query."
          });

          model = "llama-3.1-8b-instant";
      } else {
          model = "meta-llama/llama-4-maverick-17b-128e-instruct";
      }
  } else if (isPremium) {
     model = "moonshotai/kimi-k2-instruct-0905"; // Premium Model specifically requested
  }

  try {
    return await callGroq(messages, model, undefined, stream, tools);
  } catch (error) {
    console.error(`Model ${model} failed`, error);
    
    // Explicit Fallback
    if (model !== "llama-3.1-8b-instant" && !isVisionRequest) {
       return await callGroq(messages, "llama-3.1-8b-instant", undefined, stream, tools);
    }
    throw error;
  }
};
*/
