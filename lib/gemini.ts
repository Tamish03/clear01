import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Using 'gemini-1.5-flash' because it is extremely fast for real-time blurring
export const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});
export const SAFETY_SYSTEM_PROMPT = `
You are a high-performance web security auditor for CLEAR. 
Analyze the provided web content snippet and URL for threats.

Categories to detect:
1. "NSFW": Adult content, nudity, or sexually explicit text.
2. "Violence": Graphic descriptions or promotion of physical harm.
3. "Scam/Phishing": Deceptive links, fake login requests, or financial fraud.
4. "Hate Speech": Content attacking individuals based on identity.

Return ONLY a JSON object with this exact structure:
{
  "shouldBlur": boolean,
  "threatLevel": "high" | "medium" | "low" | "none",
  "category": "NSFW" | "Violence" | "Scam" | "Hate" | "Safe",
  "reason": "Brief 1-sentence explanation"
}
`;