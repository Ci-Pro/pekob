/**
 * Adsterra Ad Configuration
 * ─────────────────────────────
 * All keys are populated from the Adsterra dashboard.
 * Domain: pekobin.vercel.app | Publisher ID: 5932978
 * 
 * To regenerate keys: Adsterra Dashboard → Sites → pekobin.vercel.app → Get Code
 */

export interface AdPlacement {
  key: string;        // Adsterra placement key (zone ID from dashboard)
  format: "iframe";   // Adsterra format — always "iframe" for banners/native
  width: number;
  height: number;
}

export const ADSTERRA_CONFIG = {
  // Set to false to globally disable all ads
  enabled: true,

  // Popunder ad — highest CPM, triggers on user's first click
  popunder: {
    enabled: true,
    key: "30407714", // Zone: Popunder_1
  },

  // Social Bar — sticky social-style notification bar (bottom/side)
  socialBar: {
    enabled: true,
    key: "30407715", // Zone: SocialBar_1
  },

  // Smartlink — auto-optimizing redirect link (useful for CTAs)
  smartlink: {
    enabled: true,
    key: "30407716", // Zone: Smartlink_1
  },

  // Native Banner — blends with content, high CTR
  nativeBanner: {
    enabled: true,
    key: "30407717", // Zone: NativeBanner_1
    format: "iframe" as const,
    width: 300,
    height: 250,
  },

  // Banner 468x60 — compact horizontal banner (between sections)
  banner468: {
    enabled: true,
    key: "30407718", // Zone: 468x60_1
    format: "iframe" as const,
    width: 468,
    height: 60,
  },

  // Banner 300x250 — highest CTR banner, used between content & sidebar
  rectangle: {
    enabled: true,
    key: "30407719", // Zone: 300x250_1
    format: "iframe" as const,
    width: 300,
    height: 250,
  },

  // Banner 160x600 — skyscraper, video player sidebar
  sidebar: {
    enabled: true,
    key: "30407720", // Zone: 160x600_1
    format: "iframe" as const,
    width: 160,
    height: 600,
  },

  // Banner 728x90 — desktop leaderboard, below hero section
  leaderboard: {
    enabled: true,
    key: "30407722", // Zone: 728x90_1
    format: "iframe" as const,
    width: 728,
    height: 90,
  },

  // Banner 320x50 — mobile sticky footer
  mobileBanner: {
    enabled: true,
    key: "30407723", // Zone: 320x50_1
    format: "iframe" as const,
    width: 320,
    height: 50,
  },

  // Banner 160x300 — vertical mini-rectangle (alternative sidebar)
  banner160x300: {
    enabled: true,
    key: "30407721", // Zone: 160x300_1
    format: "iframe" as const,
    width: 160,
    height: 300,
  },

  // In-feed — uses Native Banner key for blending between video cards
  inFeed: {
    enabled: true,
    key: "30407717", // Zone: NativeBanner_1 (reuse native banner for in-feed)
    format: "iframe" as const,
    width: 300,
    height: 250,
  },
};

// Check if a placement is ready (has valid key, not a placeholder)
export function isAdReady(placement: { key: string; enabled: boolean }): boolean {
  return (
    ADSTERRA_CONFIG.enabled &&
    placement.enabled &&
    placement.key !== "" &&
    !placement.key.startsWith("REPLACE_WITH")
  );
}

// Adsterra script domains — these load the ad creative
const ADSTERRA_SCRIPT_DOMAIN = "https://a.magsrv.com";

// Build the invoke.js URL for a given placement key
export function getAdsterraScriptUrl(key: string): string {
  return `${ADSTERRA_SCRIPT_DOMAIN}/ad-provider.js`;
}
