import { NextResponse } from "next/server";

/**
 * Returns the Gemini Live API WebSocket URL with the API key.
 * This keeps the key server-side — the browser fetches this URL
 * once per call session, then connects directly to Gemini.
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

  return NextResponse.json({ wsUrl });
}
