"use client";

import { useEffect, useRef, useState } from "react";
import { ADSTERRA_CONFIG, isAdReady, getBannerScriptUrl } from "@/lib/ads-config";

/**
 * Sticky Footer Banner (320x50) — fixed at bottom on mobile only.
 * Uses the atOptions banner pattern with a dismiss button.
 * Responsive: constrained to viewport width, overflow hidden.
 */
export function StickyFooterBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const [visible, setVisible] = useState(true);
  const p = ADSTERRA_CONFIG.mobileBanner;

  useEffect(() => {
    if (!isAdReady({ key: p.key, enabled: p.enabled }) || scriptLoadedRef.current || !visible) return;

    (window as unknown as Record<string, unknown>).atOptions = {
      key: p.key,
      format: p.format,
      height: p.height,
      width: p.width,
      params: {},
    };

    const script = document.createElement("script");
    script.src = getBannerScriptUrl(p.key);
    script.async = true;
    scriptLoadedRef.current = true;
    containerRef.current?.appendChild(script);

    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, [p, visible]);

  if (!isAdReady({ key: p.key, enabled: p.enabled }) || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden max-w-[100vw] overflow-hidden">
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-7 right-2 text-[10px] text-white/40 hover:text-white/70 px-2 py-0.5 z-50"
        aria-label="Tutup iklan"
      >
        ✕
      </button>
      <div
        ref={containerRef}
        className="ad-slot flex justify-center bg-[#0a0a0a] border-t border-white/5 px-1 py-1 overflow-hidden"
        style={{ minHeight: p.height, maxWidth: "100%" }}
      />
    </div>
  );
}
