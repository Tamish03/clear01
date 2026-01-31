import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/userModel";
import ScanRecord from "@/model/ScanRecord";
import { model, SAFETY_SYSTEM_PROMPT } from "@/lib/gemini"; // Using your JSON-enabled model
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { url, contentSnippet, userId } = await request.json();
    const domain = new URL(url).hostname;
    // 1. Fetch User Settings
    const user = await UserModel.findById(userId);
    if (user?.whiteList.includes(domain)) {
  return NextResponse.json({ 
    success: true, 
    shouldBlur: false, 
    reason: "Domain is whitelisted by user." 
  });
}
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // 2. Call Gemini for Analysis
    const prompt = `${SAFETY_SYSTEM_PROMPT}\n\nURL: ${url}\nContent: ${contentSnippet}`;
    const result = await model.generateContent(prompt);
    const aiDecision = JSON.parse(result.response.text()); // Clean parsing thanks to JSON mode

    // 3. APPLY SETTINGS LOGIC
    let finalShouldBlur = false;
    const category = aiDecision.category;

    if (category === "NSFW" && user.settings.blurNSFW) finalShouldBlur = true;
    if (category === "Violence" && user.settings.blurViolence) finalShouldBlur = true;
    if (category === "Scam" && user.settings.blurScam) finalShouldBlur = true;
    if (category === "Hate" && user.settings.blurHate) finalShouldBlur = true;

    // 4. Record the Scan
    const newRecord = await ScanRecord.create({
      userId,
      url,
      threatLevel: aiDecision.threatLevel,
      category: aiDecision.category,
      actionTaken: finalShouldBlur ? "blurred" : "allowed",
    });

    return NextResponse.json({ 
      success: true, 
      shouldBlur: finalShouldBlur, 
      category: aiDecision.category,
      reason: aiDecision.reason 
    });

  } catch (error) {
    console.error("Advanced Scan Error:", error);
    return NextResponse.json({ success: false, shouldBlur: false }, { status: 500 });
  }
}