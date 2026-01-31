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
    const { domain, action } = await request.json(); // action is "add" or "remove"
    
    // Using $addToSet to prevent duplicate domains and $pull to remove them
    const updateQuery = action === 'add' 
      ? { $addToSet: { whiteList: domain } } 
      : { $pull: { whiteList: domain } };

    const updatedUser = await userModel.findByIdAndUpdate(
      session.user._id,
      updateQuery,
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Domain ${action === 'add' ? 'added to' : 'removed from'} whitelist`,
      whiteList: updatedUser?.whiteList 
    });

  } catch (error) {
    console.error("Whitelist API Error:", error);
    return NextResponse.json({ success: false, message: "Error updating whitelist" }, { status: 500 });
  }
}