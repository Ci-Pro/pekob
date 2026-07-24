"use client";

import { useEffect, useRef, useState } from "react";
import { ADSTERRA_CONFIG, isAdReady, getAdsterraScriptUrl } from "@/lib/ads-config";

/**
 * Sticky Footer Banner — 320x50 banner fixed at the bottom of the screen.
 * Only visible on mobile (< 768px).
 * This is one of the highest-visibility ad placements because it's always on screen.
 */
export function StickyFooterBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const [visible, setVisible] = useState(true);
  const { mobileBanner } = ADSTERRA_CONFIG;

  useEffect(() => {
    if (!isAdReady(mobileBanner) || scriptLoadedRef.current) return;

    const windowRef = window as unknown as Record<string, unknown>;
    windowRef.atOptions = {
      key: mobileBanner.key,
      format: mobileBanner.format,
      height: mobileBanner.height,
      width: mobileBanner.width,
      params: {},
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `${getAdsterraScriptUrl(mobileBanner.key)}/${mobileBanner.key}/invoke.js`;
    scriptLoadedRef.current = true;

    containerRef.current?.appendChild(script);

    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, [mobileBanner]);

  if (!isAdReady(mobileBanner) || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-7 right-2 text-[10px] text-white/40 hover:text-white/70 px-2 py-0.5 z-50"
        aria-label="Tutup iklan"
      >
        ✕
      </button>
      <div ref={containerRef} className="flex justify-center bg-[#0a0a0a] border-t border-white/5 px-2 py-1" />
    </div>
  );
}
