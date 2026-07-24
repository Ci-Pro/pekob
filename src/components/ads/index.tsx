"use client";

import { BannerAd, HorizontalBanner, RectangleBanner, Banner468, Banner160x300, VerticalBanner } from "./ad-banner";
import { StickyFooterBanner } from "./ad-sticky-footer";
import { PopunderTrigger } from "./ad-popunder";
import { SocialBarAd } from "./ad-social-bar";
import { NativeBannerAd } from "./ad-native-banner";
import { ADSTERRA_CONFIG } from "@/lib/ads-config";

// Re-export all components
export {
  BannerAd,
  HorizontalBanner,
  RectangleBanner,
  Banner468,
  Banner160x300,
  VerticalBanner,
  StickyFooterBanner,
  PopunderTrigger,
  SocialBarAd,
  NativeBannerAd,
};

/**
 * InFeedAd — Banner between video cards in the grid.
 * Uses 300x250 rectangle for natural content blending.
 * Responsive: takes full column width with overflow protection.
 */
export function InFeedAd({ index = 0 }: { index?: number }) {
  const { inFeed } = ADSTERRA_CONFIG;
  return (
    <div className="rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 flex items-center justify-center min-h-[180px] sm:min-h-[220px] w-full">
      <div className="w-full overflow-hidden flex justify-center">
        <BannerAd placementKey={inFeed.key} format={inFeed.format} width={inFeed.width} height={inFeed.height} enabled={inFeed.enabled} className="max-w-[300px] w-full" layout="horizontal" />
      </div>
    </div>
  );
}

/**
 * BelowHeroAd — Leaderboard banner between hero and content.
 * On mobile: shows a smaller RectangleBanner instead of the 728x90.
 */
export function BelowHeroAd() {
  return (
    <div className="py-3 w-full overflow-hidden">
      <HorizontalBanner />
    </div>
  );
}

/**
 * BetweenSectionsAd — Rectangle banner between content sections.
 * Responsive: centered, max-width constrained.
 */
export function BetweenSectionsAd() {
  return (
    <div className="py-4 flex justify-center w-full overflow-hidden">
      <div className="overflow-hidden w-full flex justify-center">
        <RectangleBanner />
      </div>
    </div>
  );
}

/**
 * AllAdsProvider — Global ad components loaded once at root layout.
 * Includes: Popunder (on click), Social Bar, Sticky Footer (mobile).
 */
export function AllAdsProvider() {
  return (
    <>
      <PopunderTrigger />
      <SocialBarAd />
      <StickyFooterBanner />
    </>
  );
}
