
import { GoogleGenAI } from "@google/genai";

// FIX: Per @google/genai guidelines, the API key must be obtained directly from the environment variable.
// Fallbacks and warnings are removed as the key is assumed to be configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeNotes = async (notes: string): Promise<string> => {
  // FIX: Per @google/genai guidelines, the API_KEY availability check is removed.
  // The application assumes the key is valid and present.
  try {
    const prompt = `Summarize the following client notes for a busy insurance agent. Extract key points, action items, and any client concerns. Format the output clearly with headings. Notes:\n\n${notes}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error summarizing notes:", error);
    return "Error: Could not summarize notes.";
  }
};
