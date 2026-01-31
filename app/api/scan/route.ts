import dbConnect from "@/lib/dbConnect";
import ScanRecordModel from "@/model/ScanRecord";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { scanSchema } from "@/schemas/scanSchema";
import { model } from "@/lib/gemini"; // Import our AI client
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = scanSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.issues[0].message }, { status: 400 });
    }

    const { url, contentSnippet } = result.data;

    // 1. AI Analysis Prompt
    const prompt = `
      Analyze this web content for safety. 
      Content: "${contentSnippet}"
      URL: "${url}"
      
      Respond ONLY in JSON format:
      {
        "threatLevel": "low" | "medium" | "high",
        "category": "string (e.g. NSFW, Violence, Phishing, Safe)",
        "shouldBlur": boolean
      }
    `;

    // 2. Call Gemini
    const aiResult = await model.generateContent(prompt);
    const aiResponse = JSON.parse(aiResult.response.text());

    // 3. Log the real AI result to the database
    const newScan = await ScanRecordModel.create({
      userId: session.user._id,
      url,
      threatLevel: aiResponse.threatLevel,
      category: aiResponse.category,
      actionTaken: aiResponse.shouldBlur ? "blurred" : "allowed",
    });

    return NextResponse.json({ 
      success: true, 
      shouldBlur: aiResponse.shouldBlur, 
      data: newScan 
    }, { status: 201 });

  } catch (error) {
    console.error("AI Scan Error:", error);
    return NextResponse.json({ success: false, message: "AI processing failed" }, { status: 500 });
  }
}