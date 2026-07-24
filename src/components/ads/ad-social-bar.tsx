"use client";

import { useEffect, useRef } from "react";
import { ADSTERRA_CONFIG, isScriptAdReady } from "@/lib/ads-config";

/**
 * Social Bar Ad — sticky social-style notification bar.
 * Uses a direct script URL, renders at page bottom.
 */
export function SocialBarAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const { socialBar } = ADSTERRA_CONFIG;

  useEffect(() => {
    if (!isScriptAdReady(socialBar) || scriptLoadedRef.current) return;

    const script = document.createElement("script");
    script.src = socialBar.scriptUrl;
    script.async = true;
    scriptLoadedRef.current = true;
    containerRef.current?.appendChild(script);

    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, [socialBar]);

  if (!isScriptAdReady(socialBar)) return null;

  return <div ref={containerRef} />;
}
