import mongoose, { Schema, Document } from "mongoose";

export interface ScanRecord extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  threatLevel: "low" | "medium" | "high";
  category: string; // e.g., "NSFW", "Violence", "Phishing"
  actionTaken: "blurred" | "allowed";
  createdAt: Date;
}

const ScanRecordSchema: Schema<ScanRecord> = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  threatLevel: { type: String, enum: ["low", "medium", "high"], required: true },
  category: { type: String, required: true },
  actionTaken: { type: String, default: "blurred" },
  createdAt: { type: Date, default: Date.now },
});

const ScanRecordModel = (mongoose.models.ScanRecord as mongoose.Model<ScanRecord>) || mongoose.model<ScanRecord>("ScanRecord", ScanRecordSchema);

export default ScanRecordModel;