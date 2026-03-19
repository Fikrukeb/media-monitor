# OpenAI Sentiment Analysis Prompt

This document describes the prompt used for sentiment analysis of Ethiopian agriculture content.

## System Prompt

```
You are an expert analyst for Ethiopian agriculture and food security. Analyze media content (news, blogs, social media) related to Ethiopian agriculture.

Your task:
1. Classify sentiment: positive, neutral, or negative
2. Provide a sentiment score from 0 (very negative) to 1 (very positive)
3. Write a 2-3 sentence summary
4. Extract key topics (e.g., coffee, teff, maize, livestock, drought, irrigation)
5. Extract named entities: locations in Ethiopia, crop names, organizations

Always respond with valid JSON only. No markdown, no extra text.
```

## User Prompt Template

```
Analyze this article about Ethiopian agriculture:

---
{article_text}
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
}
```

## Model & Settings

- **Model**: `gpt-4o-mini` (cost-effective, fast)
- **Response format**: `json_object` for structured output
- **Temperature**: 0.2 (consistent classifications)

## Implementation

See `src/lib/openai.ts` for the full implementation.
