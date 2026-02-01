import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from '../constants';
import { Restaurant } from '../types';

// Initialize the Gemini AI client
const getAIClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateFoodRecommendation = async (
    userQuery: string, 
    restaurants: Restaurant[],
    chatHistory: {role: string, parts: {text: string}[]}[] = []
): Promise<string> => {
  const ai = getAIClient();
  
  // Prepare context about available food from the dynamic state
  const menuContext = JSON.stringify(restaurants.map(r => ({
    restaurant: r.name,
    menu: r.menu.map(m => ({ name: m.name, desc: m.description, price: `KES ${m.price}`, tags: m.tags }))
  })));

  const fullPrompt = `
  Context Data (Available Campus Menus):
  ${menuContext}

  User Query: ${userQuery}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...chatHistory.map(msg => ({
            role: msg.role,
            parts: msg.parts
        })),
        {
            role: 'user',
            parts: [{ text: fullPrompt }]
        }
      ],
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I'm having trouble connecting to the food database right now. Try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm currently offline (API Error). Check your connection.";
  }
};
