"use client";

import { useEffect, useRef } from "react";
import { isAdReady, getAdsterraScriptUrl, ADSTERRA_CONFIG } from "@/lib/ads-config";

/**
 * Popunder Ad — triggers on the user's first meaningful click.
 * 
 * This is the HIGHEST CPM ad format for entertainment sites.
 * The popunder opens in a new tab behind the main window when user clicks anything.
 * 
 * IMPORTANT: 
 * - Only fires ONCE per page load to avoid annoying users
 * - Respects the global ADSTERRA_CONFIG.enabled flag
 * - Won't fire if the key is still a placeholder
 */
export function PopunderTrigger() {
  const triggeredRef = useRef(false);

  useEffect(() => {
    const { popunder } = ADSTERRA_CONFIG;
    if (!isAdReady(popunder) || triggeredRef.current) return;

    const handleClick = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      // Remove listener after first trigger
      document.removeEventListener("click", handleClick);

      // Set up Adsterra popunder options
      const windowRef = window as unknown as Record<string, unknown>;
      windowRef.atOptions = {
        key: popunder.key,
        format: "iframe",
        height: 250,
        width: 300,
        params: {},
      };

      // Load popunder script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${getAdsterraScriptUrl(popunder.key)}/${popunder.key}/invoke.js`;
      document.head.appendChild(script);
    };

    // Listen for clicks on the document — fires once
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // This component renders nothing visible
  return null;
}
