import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/userModel";
import bcrypt from "bcrypt";
import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return NextResponse.json({ success: false, message: "Username taken" }, { status: 400 });
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        isVerified: false,
      });
      await newUser.save();
    }

    // SEND THE EMAIL
    const emailResponse = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use your verified domain later
      to: email,
      subject: 'CLEAR Verification Code',
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    if (!emailResponse.data) {
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent!" }, { status: 201 });

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ success: false, message: "Error registering user" }, { status: 500 });
  }
}