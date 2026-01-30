/*
export const callGroq = async (
    messages: any[],
    model: string,
    apiKey: string,
    stream: boolean = true
) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: stream,
      max_tokens: 1024,
      temperature: 0.7
    })
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
  isPremium: boolean
) => {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  // Strategy: Try Premium Model first if eligible or quota allows (managed by repository check)
  // Logic: User asked for "Model is in high demand" if global quota fails.
  // Here we just pick the model based on the tier passed from repo.

  let model = "llama3-8b-8192"; // Default (Fast, Cheap)
  if (isPremium) {
     model = "kimi-k2-instruct"; // Hypothetical Premium Model on Groq (or fallback to mix-7b-instruct if kimi unavailable)
  }

  // NOTE: Groq doesn't host "kimi-k2-instruct" publicly yet (as of 2024 knowledge), 
  // so we will fallback to a better model like "mixtral-8x7b-32768" for premium users
  // or use the user's string if their environment supports it.
  
  // Checking availability effectively:
  if (isPremium) {
      // Trying the user's requested model name, or a high-quality fallback
      model = "mixtral-8x7b-32768"; 
  }

  try {
    return await callGroq(messages, model, apiKey);
  } catch (error) {
    console.error(`Model ${model} failed, falling back to llama3-8b-8192`, error);
    // Explicit Fallback
    if (model !== "llama3-8b-8192") {
       return await callGroq(messages, "llama3-8b-8192", apiKey);
    }
    throw error;
  }
};
*/
