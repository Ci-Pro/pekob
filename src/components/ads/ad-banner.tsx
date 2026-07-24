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
 * Responsive: wraps in overflow-hidden container, constrains width.
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

    (window as unknown as Record<string, unknown>).atOptions = {
      key: placementKey,
      format,
      height,
      width,
      params: {},
    };

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
      className={`ad-slot overflow-hidden ${layout === "horizontal" ? "mx-auto" : ""} ${className}`}
      style={{
        minHeight: height,
        maxWidth: "100%",
        width: layout === "horizontal" ? "100%" : undefined,
      }}
    />
  );
}

/** 728x90 leaderboard — below hero section, hidden on mobile */
export function HorizontalBanner({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.leaderboard;
  return (
    <div className={`hidden sm:block ${className || ""}`}>
      <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className="w-full" layout="horizontal" />
    </div>
  );
}

/** 160x600 skyscraper — video player sidebar, hidden on mobile/tablet */
export function VerticalBanner({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.sidebar;
  return (
    <div className={`hidden lg:block ${className || ""}`}>
      <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className="w-full" layout="vertical" />
    </div>
  );
}

/** 300x250 rectangle — between sections, in-feed, sidebar */
export function RectangleBanner({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.rectangle;
  return (
    <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className={`max-w-[300px] w-full mx-auto ${className || ""}`} layout="horizontal" />
  );
}

/** 468x60 compact banner — hidden on very small screens */
export function Banner468({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.banner468;
  return (
    <div className={`hidden sm:block ${className || ""}`}>
      <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className="w-full" layout="horizontal" />
    </div>
  );
}

/** 160x300 vertical mini — hidden on mobile/tablet */
export function Banner160x300({ className }: { className?: string }) {
  const p = ADSTERRA_CONFIG.banner160x300;
  return (
    <div className={`hidden lg:block ${className || ""}`}>
      <BannerAd placementKey={p.key} format={p.format} width={p.width} height={p.height} enabled={p.enabled} className="w-full" layout="vertical" />
    </div>
  );
}
