"use client";

import { useEffect, useRef } from "react";
import { ADSTERRA_CONFIG, isAdReady, getBannerScriptUrl } from "@/lib/ads-config";

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
 * Generic Banner Ad — uses atOptions + invoke.js pattern.
 * This is how Adsterra banner ads work:
 * 1. Set window.atOptions = { key, format, height, width, params }
 * 2. Load https://www.highperformanceformat.com/{key}/invoke.js
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

    // Set window.atOptions — Adsterra reads this global
    (window as unknown as Record<string, unknown>).atOptions = {
      key: placementKey,
      format,
      height,
      width,
      params: {},
    };

    // Inject invoke.js script
    const script = document.createElement("script");
    script.src = getBannerScriptUrl(placementKey);
    script.async = true;
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

/** 728x90 leaderboard — below hero section */
export function HorizontalBanner({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.leaderboard;
  return (
    <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className={className} layout="horizontal" />
  );
}

/** 160x600 skyscraper — video player sidebar */
export function VerticalBanner({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.sidebar;
  return (
    <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className={className} layout="vertical" />
  );
}

/** 300x250 rectangle — between sections, in-feed, sidebar */
export function RectangleBanner({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.rectangle;
  return (
    <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className={className} layout="horizontal" />
  );
}

/** 468x60 compact banner */
export function Banner468({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.banner468;
  return (
    <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className={className} layout="horizontal" />
  );
}

/** 160x300 vertical mini */
export function Banner160x300({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.banner160x300;
  return (
    <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className={className} layout="vertical" />
  );
}
