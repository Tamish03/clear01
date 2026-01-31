import dbConnect from "@/lib/dbConnect";
import ScanRecordModel from "@/model/ScanRecord";
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
    // Fetch only the scans belonging to the logged-in user
    const scans = await ScanRecordModel.find({ userId: session.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20);

    return NextResponse.json({ success: true, scans }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching history" }, { status: 500 });
  }
}