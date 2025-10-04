
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A bit of a hack for the playground environment.
  // In a real app, this would be handled by the build/deploy process.
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export const summarizeNotes = async (notes: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI summarization is disabled. Please configure your API key.");
  }

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
