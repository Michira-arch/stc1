import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateListingDescription = async (title: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, catchy, and professional description (max 30 words) for a student marketplace listing. 
      Title: "${title}"
      Category: "${category}"
      Tone: Helpful, student-friendly.`,
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating description.";
  }
};

export const roastResume = async (resumeText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a tough but fair senior recruiter at a top tech company. Roast this resume excerpt provided by a college student. 
      Be constructive but very direct about clichés, vague wording, or poor formatting implications. Keep it under 100 words.
      
      Resume Text: "${resumeText}"`,
    });
    return response.text || "Roast failed to cook.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI is currently on a coffee break (Error).";
  }
};