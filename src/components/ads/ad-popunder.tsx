"use client";

import { useEffect, useRef } from "react";
import { ADSTERRA_CONFIG, isScriptAdReady } from "@/lib/ads-config";

/**
 * Popunder Ad — triggers once on first user click.
 * Uses a direct script URL (not atOptions pattern).
 */
export function PopunderTrigger() {
  const triggeredRef = useRef(false);
  const { popunder } = ADSTERRA_CONFIG;

  useEffect(() => {
    if (!isScriptAdReady(popunder) || triggeredRef.current) return;

    const handleClick = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      document.removeEventListener("click", handleClick);

      const script = document.createElement("script");
      script.src = popunder.scriptUrl;
      script.async = true;
      document.head.appendChild(script);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [popunder]);

  return null;
}
