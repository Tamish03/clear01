import dbConnect from "@/lib/dbConnect"; //
import UserModel from "@/model/userModel"; //
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { signUpSchema } from "@/schemas/signUpSchema"; //
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect(); //

  try {
    const body = await request.json();

    // 1. Validate data with Zod
    const result = signUpSchema.safeParse(body); //
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error.issues.map(err => err.message).join(", ") 
        }, 
        { status: 400 }
      );
    }

    const { username, email, password } = result.data;

    // 2. Check if a verified user already has this username
    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    }); //

    if (existingVerifiedUserByUsername) {
      return NextResponse.json(
        { success: false, message: "Username is already taken" }, 
        { status: 400 }
      );
    }

    // 3. Check if email already exists
    const existingUserByEmail = await UserModel.findOne({ email }); //
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          { success: false, message: "User already exists with this email" }, 
          { status: 400 }
        );
      } else {
        // Update existing unverified user with new password and code
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
        await existingUserByEmail.save();
      }
    } else {
      // 4. Create brand new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
      }); //

      await newUser.save();
    }

    // 5. Send Verification Email using the helper
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return NextResponse.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "User registered successfully. Please verify your account." 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { success: false, message: "Error registering user" }, 
      { status: 500 }
    );
  }
}