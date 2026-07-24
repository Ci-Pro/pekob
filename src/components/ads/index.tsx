"use client";

import { BannerAd, HorizontalBanner, RectangleBanner } from "./ad-banner";
import { StickyFooterBanner } from "./ad-sticky-footer";
import { PopunderTrigger } from "./ad-popunder";
import { ADSTERRA_CONFIG } from "@/lib/ads-config";

// Re-export all components
export { BannerAd, HorizontalBanner, RectangleBanner, StickyFooterBanner, PopunderTrigger };

/**
 * InFeedAd — A banner ad styled to blend between video cards in the grid.
 * Shows as a 300x250 rectangle that looks like a video card placeholder.
 * This is the HIGHEST CTR placement because users naturally scroll through content.
 */
export function InFeedAd({ index = 0 }: { index?: number }) {
  const { inFeed } = ADSTERRA_CONFIG;

  return (
    <BannerAd
      placementKey={inFeed.key}
      format={inFeed.format}
      width={inFeed.width}
      height={inFeed.height}
      enabled={inFeed.enabled}
      className="w-full h-full"
      layout="horizontal"
    />
  );
}

/**
 * BelowHeroAd — Banner shown between hero section and video grid.
 * High visibility area — one of the first things users see after the hero.
 */
export function BelowHeroAd() {
  return (
    <div className="py-3">
      <HorizontalBanner />
    </div>
  );
}

/**
 * BetweenSectionsAd — Banner shown between video sections.
 */
export function BetweenSectionsAd() {
  return (
    <div className="py-4 flex justify-center">
      <RectangleBanner />
    </div>
  );
}

/**
 * AllAdsProvider — Renders global ad components (popunder + sticky footer).
 * Include this once at the root layout level to enable all ads site-wide.
 */
export function AllAdsProvider() {
  return (
    <>
      <PopunderTrigger />
      <StickyFooterBanner />
    </>
  );
}
