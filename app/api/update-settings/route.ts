import dbConnect from "@/lib/dbConnect"; //
import userModel from "@/model/userModel"; //
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option"; ///option.ts]
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { settings } = await request.json();
    
    // Update the specific user's settings object in MongoDB
    const updatedUser = await userModel.findByIdAndUpdate(
      session.user._id,
      { $set: { settings: settings } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Settings updated successfully",
      settings: updatedUser.settings 
    });

  } catch (error) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}