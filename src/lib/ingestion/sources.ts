/**
 * RSS and news sources for Ethiopian agriculture content
 * Includes real RSS feeds and mock data for development
 */
export interface RawArticle {
  title: string;
  content: string;
  url: string;
  sourceName: string;
  sourceType: string;
  sourceId?: string; // When from DB, use this to link directly
  publishedAt: Date;
}

// Real RSS feeds related to Ethiopia / agriculture (when available)
export const RSS_FEEDS = [
  {
    name: "AllAfrica - Ethiopia",
    url: "https://allafrica.com/ethiopia/feed/",
    type: "rss",
  },
  {
    name: "Ethiopian Reporter",
    url: "https://www.ethiopianreporter.com/feed",
    type: "rss",
  },
  {
    name: "Addis Standard",
    url: "https://addisstandard.com/feed/",
    type: "rss",
  },
];

/**
 * Mock articles for development when RSS/APIs are unavailable
 * URLs point to real Ethiopian agriculture news sources
 */
export const MOCK_ARTICLES: RawArticle[] = [
  {
    title: "Ethiopian Coffee Exports Surge Amid Global Demand",
    content: "Ethiopia's coffee exports have reached record levels this quarter, driven by increased demand from European and Asian markets. The Ministry of Agriculture reported a 15% year-over-year increase in coffee production, with Oromia and Sidama regions leading output. Farmers are benefiting from improved irrigation and better access to fertilizers.",
    url: "https://www.fao.org/ethiopia/news/en/#coffee",
    sourceName: "Ethiopian Agriculture News",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Drought Conditions Worsen in Somali Region",
    content: "Prolonged drought in Ethiopia's Somali region has left thousands of livestock dead and threatened food security. Humanitarian organizations are calling for emergency aid. The FAO has pledged support for irrigation projects and drought-resistant crop varieties.",
    url: "https://www.fao.org/emergencies/where-we-work/ETH/en/#drought",
    sourceName: "Regional News",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Teff Gains Popularity as Superfood in Western Markets",
    content: "Ethiopian teff, a gluten-free grain, is gaining traction in health-conscious markets abroad. Exporters report growing interest from the US and EU. The government is investing in quality certification to meet international standards.",
    url: "https://www.ethiopia-insight.com/#teff",
    sourceName: "Agri Export Digest",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Maize Harvest Exceeds Expectations in Amhara",
    content: "Farmers in Amhara region report a bumper maize harvest following favorable rains. The regional agriculture bureau attributes success to improved seed varieties and extension services. Storage facilities are being expanded to handle the surplus.",
    url: "https://newbusinessethiopia.com/#maize",
    sourceName: "Regional Agriculture",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Livestock Vaccination Campaign Launched in Oromia",
    content: "A nationwide livestock vaccination campaign has begun in Oromia to combat common livestock diseases. The Ministry of Agriculture partnered with international NGOs to provide vaccines for cattle, sheep, and goats. Farmers welcomed the initiative.",
    url: "https://www.fao.org/ethiopia/news/en/#livestock",
    sourceName: "Vet News Ethiopia",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Sesame Export Revenue Declines Amid Price Volatility",
    content: "Ethiopia's sesame exports have seen a 20% decline in revenue due to global price fluctuations. Traders are urging the government to diversify export markets. Some farmers are switching to other cash crops.",
    url: "https://addisfortune.news/#sesame",
    sourceName: "Export Monitor",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Irrigation Project Brings Hope to Tigray Farmers",
    content: "A new irrigation scheme in Tigray is expected to benefit over 10,000 farming households. The project, funded by development partners, will enable year-round cultivation. Local officials say it will improve food security in the region.",
    url: "https://www.fao.org/emergencies/where-we-work/ETH/en/#irrigation",
    sourceName: "Development News",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Khat Trade Faces Regulatory Scrutiny",
    content: "The Ethiopian khat trade is under review as authorities consider new regulations. Export revenues from khat remain significant, but concerns about domestic consumption have prompted policy discussions. Farmers in Hararghe depend heavily on the crop.",
    url: "https://www.ethiopia-insight.com/#khat",
    sourceName: "Policy Watch",
    sourceType: "mock",
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
];
