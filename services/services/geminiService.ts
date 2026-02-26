
import { GoogleGenAI } from "@google/genai";

export const getGeminiService = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getMarketSentiment = async () => {
  const ai = getGeminiService();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Generate a brief, 3-sentence crypto market sentiment analysis for today. Mention BTC, ETH, and a trending altcoin. Keep it professional and encouraging for investors.',
  });
  return response.text;
};

export const getInvestmentAdvice = async (balance: number, planName: string) => {
  const ai = getGeminiService();
  const prompt = `A user has a balance of $${balance} and is looking at the ${planName} investment plan. 
  Give them 3 professional tips on risk management and portfolio diversification in the current crypto climate. 
  Keep it concise and formatted with bullet points.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text;
};
