import { ScanRecord } from "@/model/ScanRecord";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean; // Useful for later toggles
  scans?: Array<ScanRecord>;
  whiteList?: string[]; // Add this to support whitelisting features
}