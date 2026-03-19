/**
 * POST /api/analyze - Run OpenAI sentiment analysis on provided text
 */
import { NextResponse } from "next/server";
import { analyzeSentiment } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' in request body" },
        { status: 400 }
      );
    }

    const result = await analyzeSentiment(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze API error:", error);

    const message = error instanceof Error ? error.message : "Analysis failed";
    const status = message.includes("OPENAI_API_KEY") ? 500 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
