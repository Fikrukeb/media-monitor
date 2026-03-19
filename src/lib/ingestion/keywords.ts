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
 * Check if text contains any agriculture-related keywords (case-insensitive)
 */
export function matchesAgricultureKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return AGRICULTURE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}
