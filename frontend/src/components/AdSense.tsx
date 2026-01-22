"use client";

import { useEffect } from "react";

interface AdSenseProps {
  adSlot?: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  adLayout?: string;
  fullWidthResponsive?: boolean;
  className?: string;
}

export default function AdSense({
  adSlot,
  adFormat = "auto",
  adLayout,
  fullWidthResponsive = true,
  className = "",
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Перевіряємо, чи ініціалізовано AdSense скрипт
      if (typeof window !== 'undefined' && typeof (window as any).adsbygoogle !== 'undefined') {
        // Використовуємо затримку, щоб переконатися, що ініціалізація page_level_ads вже відбулася
        setTimeout(() => {
          try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          } catch (innerErr) {
            console.error("AdSense delayed push error:", innerErr);
          }
        }, 200);
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7434166826056099"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
