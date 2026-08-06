export interface RawSourceInput {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  referrer_domain?: string | null;
  how_heard_raw?: string | null;
}

/**
 * Normalizes raw UTM parameters, referrer strings, and free-text 'how heard' answers
 * into a clean, canonical source_label.
 *
 * Rules:
 * 1. utm_source = 'twitter' or 'x' -> "X"
 * 2. utm_source = 'reddit' OR referrer contains 'reddit.com' -> "Reddit"
 * 3. utm_source = 'producthunt' OR referrer contains 'producthunt.com' -> "Product Hunt"
 * 4. referrer contains 'google.' and no UTMs -> "Google (organic)"
 * 5. no referrer, no UTMs, no how_heard_raw -> "Direct / Unknown"
 * 6. how_heard_raw is filled and nothing else matched -> trimmed, lowercased free-text
 */
export function normalizeSource(data: RawSourceInput): string {
  const utmSource = data.utm_source?.trim().toLowerCase() || "";
  const utmMedium = data.utm_medium?.trim().toLowerCase() || "";
  const utmCampaign = data.utm_campaign?.trim().toLowerCase() || "";
  const utmTerm = data.utm_term?.trim().toLowerCase() || "";
  const utmContent = data.utm_content?.trim().toLowerCase() || "";

  const referrer = (data.referrer || data.referrer_domain || "").trim().toLowerCase();
  const howHeardRaw = data.how_heard_raw?.trim() || "";

  const hasUtms = Boolean(
    utmSource || utmMedium || utmCampaign || utmTerm || utmContent
  );

  // Rule 1: utm_source = 'twitter' or 'x' -> "X"
  if (utmSource === "twitter" || utmSource === "x") {
    return "X";
  }

  // Rule 2: utm_source = 'reddit' OR referrer contains 'reddit.com' -> "Reddit"
  if (utmSource === "reddit" || referrer.includes("reddit.com")) {
    return "Reddit";
  }

  // Rule 3: utm_source = 'producthunt' OR referrer contains 'producthunt.com' -> "Product Hunt"
  if (utmSource === "producthunt" || referrer.includes("producthunt.com")) {
    return "Product Hunt";
  }

  // Rule 4: referrer contains 'google.' and no UTMs -> "Google (organic)"
  if (referrer.includes("google.") && !hasUtms) {
    return "Google (organic)";
  }

  // Rule 5: no referrer, no UTMs, no how_heard_raw -> "Direct / Unknown"
  if (!referrer && !hasUtms && !howHeardRaw) {
    return "Direct / Unknown";
  }

  // Rule 6: how_heard_raw is filled and nothing else matched -> use trimmed, lowercased free-text directly
  if (howHeardRaw) {
    return howHeardRaw.toLowerCase();
  }

  // Fallback for custom UTM sources or referrers that didn't match specific rules above
  if (utmSource) {
    return utmSource;
  }

  if (referrer) {
    return referrer;
  }

  return "Direct / Unknown";
}
