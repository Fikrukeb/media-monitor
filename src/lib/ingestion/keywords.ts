/**
 * Keywords for filtering Ethiopian agriculture content
 * Used to match and prioritize relevant articles
 */
export const AGRICULTURE_KEYWORDS = [
  "Ethiopian agriculture",
  "farming in Ethiopia",
  "Ethiopia farming",
  "coffee production",
  "coffee Ethiopia",
  "teff",
  "maize Ethiopia",
  "livestock Ethiopia",
  "Ethiopian livestock",
  "wheat Ethiopia",
  "barley Ethiopia",
  "sorghum Ethiopia",
  "Oromia agriculture",
  "Amhara agriculture",
  "Tigray agriculture",
  "Ethiopian food security",
  "drought Ethiopia",
  "irrigation Ethiopia",
  "Ethiopian farmers",
  "agricultural export Ethiopia",
  "khat Ethiopia",
  "sesame Ethiopia",
  "pulses Ethiopia",
  "Ethiopian Ministry of Agriculture",
  "FAO Ethiopia",
  "agricultural development Ethiopia",
];

/**
 * Broader English terms for aggregator feeds (e.g. Google News) where headlines
 * may not include phrases like "Ethiopian agriculture" but are still farm/rural-food related.
 */
export const GENERAL_AGRICULTURE_TERMS = [
  "agriculture",
  "agricultural",
  "agronomy",
  "farmer",
  "farmers",
  "farming",
  "livestock",
  "pastoral",
  "crop",
  "crops",
  "cultivation",
  "cultivate",
  "harvest",
  "irrigation",
  "fertilizer",
  "fertiliser",
  "cereal",
  "maize",
  "wheat",
  "teff",
  "sorghum",
  "barley",
  "millet",
  "food security",
  "rural development",
  "fao",
  "world food programme",
  "wfp",
  "ifad",
  "veterinar",
  "food aid",
  "humanitarian food",
  "drought",
  "famine",
  "khat",
  "sesame",
  "coffee",
  "export crop",
  "grain",
  "horticulture",
  "pesticide",
  "seed variety",
  "extension service",
  "smallholder",
  "pastoralist",
];

/**
 * Check if text contains any agriculture-related keywords (case-insensitive)
 */
export function matchesAgricultureKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return AGRICULTURE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export function matchesGeneralAgricultureTerms(text: string): boolean {
  const lower = text.toLowerCase();
  return GENERAL_AGRICULTURE_TERMS.some((t) => lower.includes(t));
}
