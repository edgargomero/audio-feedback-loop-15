
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
export const SUPABASE_ANON_KEY = '6778059879e28c116ce43a6ab80dfb6c';
export const SUPABASE_SERVICE_KEY = '33c19738cbde13436299b670b06088903e47842ba6632fbda9f4f30a46bd24f1';
export const BUCKET_NAME = 'audio-recordings';
export const APP_VERSION = '1.0.5';
