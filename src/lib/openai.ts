/**
 * OpenAI sentiment analysis utility for Ethiopian agriculture content
 * Uses structured JSON output for reliable parsing
 */
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SentimentAnalysisResult {
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  summary: string;
  keyTopics: string[];
  entities?: {
    locations?: string[];
    crops?: string[];
    organizations?: string[];
  };
  sentimentReason?: string;
}

const SENTIMENT_SYSTEM_PROMPT = `You are an expert analyst for Ethiopian agriculture and food security. Analyze media content (news, blogs, social media) related to Ethiopian agriculture.

Your task:
1. Classify sentiment: positive, neutral, or negative
2. Provide a sentiment score from 0 (very negative) to 1 (very positive)
3. Write a 2-3 sentence summary
4. Extract key topics (e.g., coffee, teff, maize, livestock, drought, irrigation)
5. Extract named entities: locations in Ethiopia, crop names, organizations

Always respond with valid JSON only. No markdown, no extra text.`;

const SENTIMENT_USER_PROMPT = (text: string) => `Analyze this article about Ethiopian agriculture:

---
${text.slice(0, 4000)}
---

Return JSON in this exact format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "sentimentScore": 0.0 to 1.0,
  "summary": "2-3 sentence summary",
  "keyTopics": ["topic1", "topic2"],
  "entities": {
    "locations": ["Addis Ababa", "Oromia"],
    "crops": ["coffee", "teff"],
    "organizations": ["Ministry of Agriculture"]
  },
  "sentimentReason": "Brief explanation of why this sentiment was assigned"
}`;

/**
 * Analyzes article text using OpenAI and returns structured sentiment + metadata
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SENTIMENT_SYSTEM_PROMPT },
      { role: "user", content: SENTIMENT_USER_PROMPT(text) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as SentimentAnalysisResult;

  // Validate and clamp sentiment score
  parsed.sentimentScore = Math.max(0, Math.min(1, Number(parsed.sentimentScore) || 0.5));
  parsed.sentiment = ["positive", "neutral", "negative"].includes(parsed.sentiment)
    ? parsed.sentiment
    : "neutral";

  return parsed;
}
