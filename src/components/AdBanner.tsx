"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_PUBLISHER_ID, ADSENSE_AD_SLOT } from "@/config/constants";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner() {
  const pushed = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }

    // 광고가 실제로 로드되었는지 확인
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector("ins");
      if (ins && ins.getAttribute("data-ad-status") === "filled") {
        setAdLoaded(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl overflow-hidden ${adLoaded ? "bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200" : ""}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: adLoaded ? "block" : "none", width: "100%", height: "60px" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={ADSENSE_AD_SLOT}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
