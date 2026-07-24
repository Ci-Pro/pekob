"use client";

import { useEffect, useRef } from "react";
import { ADSTERRA_CONFIG, isAdReady, getAdsterraScriptUrl } from "@/lib/ads-config";

interface BannerAdProps {
  placementKey: string;
  format: "iframe";
  width: number;
  height: number;
  enabled: boolean;
  className?: string;
  layout?: "horizontal" | "vertical";
}

/**
 * Generic Banner Ad component for Adsterra.
 * Renders a banner of specified dimensions with the Adsterra placement key.
 * Automatically loads the Adsterra script on mount.
 */
export function BannerAd({
  placementKey,
  format,
  width,
  height,
  enabled,
  className = "",
  layout = "horizontal",
}: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!isAdReady({ key: placementKey, enabled }) || scriptLoadedRef.current) return;

    // Set global atOptions for this placement
    const windowRef = window as unknown as Record<string, unknown>;
    windowRef.atOptions = {
      key: placementKey,
      format,
      height,
      width,
      params: {},
    };

    // Create and inject the Adsterra script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `${getAdsterraScriptUrl(placementKey)}/${placementKey}/invoke.js`;
    scriptLoadedRef.current = true;

    containerRef.current?.appendChild(script);

    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, [placementKey, format, width, height, enabled]);

  if (!isAdReady({ key: placementKey, enabled })) return null;

  return (
    <div
      ref={containerRef}
      className={`flex ${layout === "horizontal" ? "justify-center" : "justify-start"} ${className}`}
      style={{
        minHeight: height,
        minWidth: layout === "horizontal" ? Math.min(width, 728) : width,
      }}
    />
  );
}

/**
 * Horizontal banner — 728x90 leaderboard, centered.
 * Best placement: below hero section, between video sections.
 */
export function HorizontalBanner({ className }: { className?: string }) {
  const { leaderboard } = ADSTERRA_CONFIG;
  return (
    <BannerAd
      placementKey={leaderboard.key}
      format={leaderboard.format}
      width={leaderboard.width}
      height={leaderboard.height}
      enabled={leaderboard.enabled}
      className={className}
      layout="horizontal"
    />
  );
}

/**
 * Vertical banner — 160x600 skyscraper.
 * Best placement: video player sidebar.
 */
export function VerticalBanner({ className }: { className?: string }) {
  const { sidebar } = ADSTERRA_CONFIG;
  return (
    <BannerAd
      placementKey={sidebar.key}
      format={sidebar.format}
      width={sidebar.width}
      height={sidebar.height}
      enabled={sidebar.enabled}
      className={className}
      layout="vertical"
    />
  );
}

/**
 * Rectangle banner — 300x250, the highest CTR banner format.
 * Best placement: between video cards (in-feed), video player sidebar.
 */
export function RectangleBanner({ className }: { className?: string }) {
  const { rectangle } = ADSTERRA_CONFIG;
  return (
    <BannerAd
      placementKey={rectangle.key}
      format={rectangle.format}
      width={rectangle.width}
      height={rectangle.height}
      enabled={rectangle.enabled}
      className={className}
      layout="horizontal"
    />
  );
}
