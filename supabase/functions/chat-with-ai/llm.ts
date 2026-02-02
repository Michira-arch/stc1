/*
export const callGroq = async (
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

// Fallback Logic
export const generateResponse = async (
  messages: any[],
  isPremium: boolean,
  tools?: any[],
  stream: boolean = true
) => {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  // Strategy: Try Premium Model first if eligible or quota allows (managed by repository check)
  // Logic: User asked for "Model is in high demand" if global quota fails.
  // Here we just pick the model based on the tier passed from repo.

  let model = "llama3-8b-8192"; // Default (Fast, Cheap)
  if (isPremium) {
     model = "kimi-k2-instruct-0905"; // Premium Model as requested
  }

  try {
    return await callGroq(messages, model, apiKey, stream, tools);
  } catch (error) {
    console.error(`Model ${model} failed, falling back to llama3-8b-8192`, error);
    // Explicit Fallback
    if (model !== "llama3-8b-8192") {
       return await callGroq(messages, "llama3-8b-8192", apiKey, stream, tools);
    }
    throw error;
  }
};
*/
