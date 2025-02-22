
import { SalesAnalysis, SalesStage } from "./sales";

export interface FeedbackState {
  type: "positive" | "neutral" | "negative";
  message: string;
  stage?: SalesStage;
  analysis?: Partial<SalesAnalysis>;
}

export const RECORDING_TIMEOUT = 10000;
export const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/468699b2kb5eoh918zklajo9um4mk9ia';
export const SUPABASE_URL = 'https://vpvjfmxakuwphkcdsvze.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmpmbXhha3V3cGhrY2RzdnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1OTY0NDcsImV4cCI6MjAyNTE3MjQ0N30.hPp5RQs5hCBL3PV9U7HFu5k52uHDFnEJ0DC1S2BF_U0';
export const BUCKET_NAME = 'audio-recordings';
export const APP_VERSION = '1.0.5'; // Incrementado para tracking
