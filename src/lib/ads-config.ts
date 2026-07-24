/**
 * Adsterra Ad Configuration
 * ─────────────────────────────
 * Real keys and script URLs from Adsterra dashboard.
 * Domain: pekobin.vercel.app
 * 
 * Script URL patterns:
 * - Banner (atOptions): https://www.highperformanceformat.com/{key}/invoke.js
 * - Popunder: direct script URL
 * - Social Bar: direct script URL
 * - Native Banner: invoke.js + container div
 * - Smartlink: redirect URL
 */

export interface AdPlacement {
  key: string;
  format: "iframe";
  width: number;
  height: number;
}

export const ADSTERRA_CONFIG = {
  // Set to false to globally disable all ads
  enabled: true,

  // Popunder — triggers on first click (highest CPM)
  popunder: {
    enabled: true,
    scriptUrl: "https://pl30508213.effectivecpmnetwork.com/ba/51/af/ba51afb737520fdfc617bdc7cf001dd4.js",
  },

  // Social Bar — sticky social notification bar
  socialBar: {
    enabled: true,
    scriptUrl: "https://pl30508214.effectivecpmnetwork.com/39/ff/bd/39ffbd8ae62d3d58024f1e5c579e9b06.js",
  },

  // Smartlink — auto-optimizing redirect URL
  smartlink: {
    enabled: true,
    url: "https://www.effectivecpmnetwork.com/j4jarb40?key=7f1782164eeabf28b1220e561f16fdbf",
  },

  // Native Banner — blends with content (uses container div pattern)
  nativeBanner: {
    enabled: true,
    scriptUrl: "https://pl30508216.effectivecpmnetwork.com/d261392b9904e6149fd37338027b2f86/invoke.js",
    containerId: "container-d261392b9904e6149fd37338027b2f86",
    format: "iframe" as const,
    width: 300,
    height: 250,
  },

  // Banner 300x250 — highest CTR banner, between content & sidebar
  rectangle: {
    enabled: true,
    key: "7cc43cfd34264164c5688afa587b23e1",
    format: "iframe" as const,
    width: 300,
    height: 250,
  },

  // Banner 728x90 — desktop leaderboard, below hero section
  leaderboard: {
    enabled: true,
    key: "0da906bbe6936b051f5cc0c36f25c58d",
    format: "iframe" as const,
    width: 728,
    height: 90,
  },

  // Banner 320x50 — mobile sticky footer
  mobileBanner: {
    enabled: true,
    key: "3ab6ce7bff1aa57c440f6883a4a12166",
    format: "iframe" as const,
    width: 320,
    height: 50,
  },

  // Banner 160x600 — skyscraper, video player sidebar
  sidebar: {
    enabled: true,
    key: "00c6f90602084df3cc3cdf52be6b2f8e",
    format: "iframe" as const,
    width: 160,
    height: 600,
  },

  // Banner 468x60 — compact horizontal banner
  banner468: {
    enabled: true,
    key: "748b38c0ab44f798f596269fbaf33262",
    format: "iframe" as const,
    width: 468,
    height: 60,
  },

  // Banner 160x300 — vertical mini-rectangle
  banner160x300: {
    enabled: true,
    key: "fde26f704fb7dc67eff863c479e86ac2",
    format: "iframe" as const,
    width: 160,
    height: 300,
  },

  // In-feed — uses rectangle (300x250) key for blending between video cards
  inFeed: {
    enabled: true,
    key: "7cc43cfd34264164c5688afa587b23e1",
    format: "iframe" as const,
    width: 300,
    height: 250,
  },
};

// Script domain for banner ads (atOptions pattern)
const BANNER_SCRIPT_DOMAIN = "https://www.highperformanceformat.com";

// Build invoke.js URL for a banner key
export function getBannerScriptUrl(key: string): string {
  return `${BANNER_SCRIPT_DOMAIN}/${key}/invoke.js`;
}

// Check if a key-based placement is ready
export function isAdReady(placement: { key: string; enabled: boolean }): boolean {
  return (
    ADSTERRA_CONFIG.enabled &&
    placement.enabled &&
    placement.key !== "" &&
    !placement.key.startsWith("REPLACE_WITH")
  );
}

// Check if a script-based placement is ready
export function isScriptAdReady(placement: { scriptUrl: string; enabled: boolean }): boolean {
  return (
    ADSTERRA_CONFIG.enabled &&
    placement.enabled &&
    placement.scriptUrl !== "" &&
    !placement.scriptUrl.startsWith("REPLACE_WITH")
  );
}
