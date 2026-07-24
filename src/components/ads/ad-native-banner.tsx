"use client";

import { useEffect, useRef } from "react";
import { ADSTERRA_CONFIG, isScriptAdReady } from "@/lib/ads-config";

/**
 * Native Banner Ad — uses invoke.js + container div pattern.
 * Blends naturally with content for high CTR.
 */
export function NativeBannerAd({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const { nativeBanner } = ADSTERRA_CONFIG;

  useEffect(() => {
    if (!isScriptAdReady(nativeBanner) || scriptLoadedRef.current) return;

    // Ensure the container div exists
    const existingContainer = document.getElementById(nativeBanner.containerId);
    if (!existingContainer) {
      const div = document.createElement("div");
      div.id = nativeBanner.containerId;
      containerRef.current?.appendChild(div);
    }

    const script = document.createElement("script");
    script.src = nativeBanner.scriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    scriptLoadedRef.current = true;
    containerRef.current?.appendChild(script);

    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, [nativeBanner]);

  if (!isScriptAdReady(nativeBanner)) return null;

  return (
    <div
      ref={containerRef}
      className={`flex justify-center min-h-[250px] ${className || ""}`}
    />
  );
}
