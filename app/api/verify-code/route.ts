import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/userModel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isCodeValid = user.verifyCode === code;

    if (isCodeValid) {
      user.isVerified = true;
      await user.save();
      return NextResponse.json({ success: true, message: "Account verified!" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Incorrect code" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error verifying user" }, { status: 500 });
  }
}