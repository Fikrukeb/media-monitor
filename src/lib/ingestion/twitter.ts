/**
 * Twitter/X fetcher - uses Twitter API v2 when TWITTER_BEARER_TOKEN is set
 * Falls back to mock data if no API key
 */
import { matchesAgricultureKeywords } from "./keywords";
import type { RawArticle } from "./sources";

const MOCK_TWITTER_POSTS: RawArticle[] = [
  {
    title: "Ethiopian coffee exports hit record high this quarter. Great news for farmers in Oromia and Sidama! #Ethiopia #Coffee",
    content: "Ethiopian coffee exports hit record high this quarter. Great news for farmers in Oromia and Sidama! #Ethiopia #Coffee",
    url: "https://x.com/FAO",
    sourceName: "Twitter/X",
    sourceType: "twitter",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    title: "Drought in Somali region continues to affect livestock. FAO and partners providing emergency feed. #Ethiopia #Agriculture",
    content: "Drought in Somali region continues to affect livestock. FAO and partners providing emergency feed. #Ethiopia #Agriculture",
    url: "https://x.com/FAOEthiopia",
    sourceName: "Twitter/X",
    sourceType: "twitter",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    title: "Teff gaining popularity in EU markets. Ethiopian exporters see 20% growth in demand. #Teff #Ethiopia",
    content: "Teff gaining popularity in EU markets. Ethiopian exporters see 20% growth in demand. #Teff #Ethiopia",
    url: "https://x.com/FAOAfrica",
    sourceName: "Twitter/X",
    sourceType: "twitter",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

export async function fetchTwitter(
  handle?: string,
  useMockFallback = true
): Promise<RawArticle[]> {
  const token = process.env.TWITTER_BEARER_TOKEN;

  if (!token && useMockFallback) {
    return MOCK_TWITTER_POSTS.filter((p) =>
      matchesAgricultureKeywords(`${p.title} ${p.content}`)
    );
  }

  if (!token) return [];

  try {
    const searchQuery = handle
      ? `from:${handle} (Ethiopia OR agriculture OR coffee OR teff OR farming)`
      : "(Ethiopia agriculture) OR (Ethiopia coffee) OR (Ethiopia farming) OR (teff Ethiopia)";

    const url = new URL("https://api.twitter.com/2/tweets/search/recent");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("max_results", "20");
    url.searchParams.set("tweet.fields", "created_at,text");
    url.searchParams.set("expansions", "author_id");
    url.searchParams.set("user.fields", "username");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn("Twitter API error:", res.status, await res.text());
      return useMockFallback ? MOCK_TWITTER_POSTS : [];
    }

    const data = (await res.json()) as {
      data?: Array<{ id: string; text: string; created_at: string }>;
      includes?: { users?: Array<{ username: string }> };
    };

    const tweets = data.data ?? [];
    const users = data.includes?.users ?? [];
    const username = users[0]?.username ?? handle ?? "unknown";

    const articles: RawArticle[] = [];

    for (const tweet of tweets) {
      const text = tweet.text;
      if (!matchesAgricultureKeywords(text)) continue;

      articles.push({
        title: text.slice(0, 200),
        content: text,
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        sourceName: `Twitter/X: @${username}`,
        sourceType: "twitter",
        publishedAt: new Date(tweet.created_at),
      });
    }

    return articles;
  } catch (error) {
    console.error("Twitter fetch error:", error);
    return useMockFallback ? MOCK_TWITTER_POSTS : [];
  }
}
