import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await userModel.findById(session.user._id).select('settings whiteList');
    
    return NextResponse.json({ 
      success: true, 
      settings: user?.settings, 
      whiteList: user?.whiteList 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch user data" }, { status: 500 });
  }
}