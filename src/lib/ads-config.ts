/**
 * Adsterra Ad Configuration
 * ─────────────────────────────
 * Replace all "REPLACE_WITH_YOUR_KEY" values with your actual Adsterra placement keys.
 * 
 * HOW TO GET YOUR KEYS:
 * 1. Go to https://www.adsterra.com/ and sign up / log in
 * 2. Add your website (pekob.com) and wait for approval
 * 3. Go to "Sites" → "Your Site" → "New Zone"
 * 4. Create zones for each ad format (see recommendations below)
 * 5. Copy the "key" value from each zone's code into this file
 * 
 * RECOMMENDED ZONES TO CREATE (highest CTR for video entertainment sites):
 * ─────────────────────────────────────────────────────────────────
 * 1. Banner 300x250   — "Leaderboard" zone → place below hero / between content
 * 2. Banner 728x90    — "Mobile Leaderboard" zone → below header on desktop
 * 3. Banner 320x50    — "Mobile Banner" zone → sticky at bottom on mobile
 * 4. Banner 300x100   — "Social Bar" zone → sticky social notification bar
 * 5. Popunder         — "Popunder" zone → triggers on first click (highest CPM)
 * 
 * TIPS FOR MAXIMUM REVENUE:
 * - Place ads between video cards (in-feed) — highest CTR
 * - Use sticky footer banner on mobile — always visible
 * - Popunder on video play click — natural user interaction
 * - Banner below hero section — first visible area after landing
 * - Banner in video player sidebar — high engagement area
 * ─────────────────────────────────────────────────────────────────
 */

export interface AdPlacement {
  key: string;        // Adsterra placement key (from dashboard)
  format: "iframe";   // Adsterra format — always "iframe" for banners/native
  width: number;
  height: number;
}

export const ADSTERRA_CONFIG = {
  // Set to false to globally disable all ads (useful during development)
  enabled: true,

  // Popunder ad — highest CPM, triggers on user's first click
  // This is the MOST profitable ad format for entertainment sites
  popunder: {
    enabled: true,
    key: "REPLACE_WITH_YOUR_POPUNDER_KEY", // From Adsterra: New Zone → Popunder
  },

  // ── Banner Ad Placements ──
  // Desktop leaderboard (728x90) — shows below hero section on desktop
  leaderboard: {
    enabled: true,
    key: "REPLACE_WITH_YOUR_LEADERBOARD_KEY", // From Adsterra: New Zone → Banner 728x90
    format: "iframe" as const,
    width: 728,
    height: 90,
  },

  // Medium rectangle (300x250) — highest CTR banner, used between content
  rectangle: {
    enabled: true,
    key: "REPLACE_WITH_YOUR_RECTANGLE_KEY", // From Adsterra: New Zone → Banner 300x250
    format: "iframe" as const,
    width: 300,
    height: 250,
  },

  // Mobile banner (320x50) — sticky at bottom on mobile
  mobileBanner: {
    enabled: true,
    key: "REPLACE_WITH_YOUR_MOBILE_BANNER_KEY", // From Adsterra: New Zone → Banner 320x50
    format: "iframe" as const,
    width: 320,
    height: 50,
  },

  // In-feed native (300x250) — blends between video cards
  inFeed: {
    enabled: true,
    key: "REPLACE_WITH_YOUR_INFEED_KEY", // From Adsterra: New Zone → Banner 300x250 (use same as rectangle or different)
    format: "iframe" as const,
    width: 300,
    height: 250,
  },

  // Sidebar banner (160x600) — video player sidebar
  sidebar: {
    enabled: true,
    key: "REPLACE_WITH_YOUR_SIDEBAR_KEY", // From Adsterra: New Zone → Banner 160x600
    format: "iframe" as const,
    width: 160,
    height: 600,
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
