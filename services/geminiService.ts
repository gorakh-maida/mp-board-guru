
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize GoogleGenAI with process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

/**
 * Generates images using gemini-2.5-flash-image which has higher availability
 * than Imagen 4 for standard educational accounts.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High quality educational diagram or illustration: ${prompt}` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image part as per SDK guidelines
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    // Handle 429 specifically with a logged warning
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.warn("Quota exceeded for image generation. Falling back to text-only mode.");
    }
    return null;
  }
};

export const sendMessageToGemini = async (
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text?: string; inlineData?: any }[] }[] = [],
  fileData?: { data: string; mimeType: string }
): Promise<{ text: string; groundingUrls?: { uri: string; title: string }[] }> => {
  const ai = getAI();
  
  try {
    const parts: any[] = [{ text: prompt }];
    if (fileData) {
      parts.push({
        inlineData: {
          data: fileData.data,
          mimeType: fileData.mimeType
        }
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that request.";
    
    // Extract grounding chunks if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title
      }));

    return { text, groundingUrls };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error connecting to MP Board Guru. Please try again in a few moments." };
  }
};
