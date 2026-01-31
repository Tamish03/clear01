import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/userModel"; // Using your userModel
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect(); //Connect to the databses 

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    
    // Find user by username
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if code matches and hasn't expired (if you add expiry later)
    const isCodeValid = user.verifyCode === code;

    if (isCodeValid) {
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying account" },
      { status: 500 }
    );
  }
}