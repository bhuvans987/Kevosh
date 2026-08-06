'use client';

import { useEffect } from 'react';
import { captureAttributionFromUrl, storeAttributionData } from '@/lib/attribution';

export function AttributionTracker() {
  useEffect(() => {
    const attrData = captureAttributionFromUrl();
    if (attrData) {
      storeAttributionData(attrData);
    }
  }, []);

  return null;
}
