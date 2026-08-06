export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: string;
}

const COOKIE_NAME = 'attr_src';
const STORAGE_KEY = 'attr_src';
const COOKIE_MAX_AGE_DAYS = 30;

export function captureAttributionFromUrl(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source')?.trim();
  const utmMedium = urlParams.get('utm_medium')?.trim();
  const utmCampaign = urlParams.get('utm_campaign')?.trim();
  const utmTerm = urlParams.get('utm_term')?.trim();
  const utmContent = urlParams.get('utm_content')?.trim();

  let referrer = document.referrer?.trim() || undefined;
  if (referrer) {
    try {
      const refUrl = new URL(referrer);
      if (refUrl.origin === window.location.origin) {
        referrer = undefined;
      }
    } catch {
      // Invalid URL string
    }
  }

  const hasUtm = Boolean(utmSource || utmMedium || utmCampaign || utmTerm || utmContent);

  if (!hasUtm && !referrer) {
    return null;
  }

  const data: AttributionData = {
    ...(utmSource && { utm_source: utmSource }),
    ...(utmMedium && { utm_medium: utmMedium }),
    ...(utmCampaign && { utm_campaign: utmCampaign }),
    ...(utmTerm && { utm_term: utmTerm }),
    ...(utmContent && { utm_content: utmContent }),
    ...(referrer && { referrer }),
    landing_page: window.location.href,
    timestamp: new Date().toISOString(),
  };

  return data;
}

export function storeAttributionData(data: AttributionData): void {
  if (typeof window === 'undefined') return;

  try {
    const jsonStr = JSON.stringify(data);

    // Store in sessionStorage
    sessionStorage.setItem(STORAGE_KEY, jsonStr);

    // Store in 30-day first-party cookie
    const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(jsonStr)}; max-age=${maxAge}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  } catch (err) {
    console.error('[Attribution] Failed to store attribution data:', err);
  }
}

export function getStoredAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Try sessionStorage first
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    // 2. Fallback to cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, val] = cookie.trim().split('=');
      if (name === COOKIE_NAME && val) {
        const decoded = decodeURIComponent(val);
        return JSON.parse(decoded);
      }
    }
  } catch (err) {
    console.error('[Attribution] Failed to read stored attribution data:', err);
  }

  return null;
}
