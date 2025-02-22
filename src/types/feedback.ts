
import { SalesAnalysis, SalesStage } from "./sales";

export interface FeedbackState {
  type: "positive" | "neutral" | "negative";
  message: string;
  stage?: SalesStage;
  analysis?: Partial<SalesAnalysis>;
}

export const RECORDING_TIMEOUT = 5000; // Cambiado a 5 segundos
export const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/468699b2kb5eoh918zklajo9um4mk9ia';
export const SUPABASE_URL = 'https://fajhodgsoykvmdgbsrud.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhamhvZGdzb3lrdm1kZ2JzcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1OTY0NDcsImV4cCI6MjAyNTE3MjQ0N30.EkyRW6CNFKhyduYjCGL6I7NvyXxKwnbgUYQYBo1oL78';
export const BUCKET_NAME = 'audio-recordings';
export const APP_VERSION = '1.0.1'; // Añadido contador de versión
