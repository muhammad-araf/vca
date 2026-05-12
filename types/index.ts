export interface Business {
  id: string;
  user_id: string;
  name: string;
  domain?: string;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface Agent {
  id: string;
  business_id: string;
  name: string;
  voice_name: string;
  system_prompt: string;
  language: "en" | "ur" | "hinglish";
  personality: string;
  business_type?: string;
  is_active: boolean;
  widget_key: string;
  total_conversations: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  agent_id: string;
  type: "text" | "url" | "faq";
  title?: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  visitor_id?: string;
  started_at: string;
  ended_at?: string;
  duration_secs?: number;
  transcript: TranscriptEntry[];
  sentiment?: "positive" | "neutral" | "negative";
  outcome?: "completed" | "abandoned" | "converted";
}

export interface TranscriptEntry {
  role: "user" | "ai" | "system";
  text: string;
  timestamp: number;
}

export interface Analytics {
  id: string;
  agent_id: string;
  date: string;
  total_calls: number;
  avg_duration_secs: number;
  conversion_rate: number;
  sentiment_score: number;
}

export const VOICES = [
  { id: "Zephyr", label: "Zephyr", gender: "Female", description: "Warm & natural" },
  { id: "Aoede", label: "Aoede", gender: "Female", description: "Smooth & professional" },
  { id: "Kore", label: "Kore", gender: "Female", description: "Clear & articulate" },
  { id: "Charon", label: "Charon", gender: "Male", description: "Deep & confident" },
  { id: "Puck", label: "Puck", gender: "Male", description: "Friendly & energetic" },
  { id: "Fenrir", label: "Fenrir", gender: "Male", description: "Calm & authoritative" },
];

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ur", label: "Urdu" },
  { id: "hinglish", label: "Hinglish (Urdu + English)" },
];

export const PERSONALITY_PRESETS = [
  "professional", "friendly", "formal", "casual", "empathetic", "assertive",
];
