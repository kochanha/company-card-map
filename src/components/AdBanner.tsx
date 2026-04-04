"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "60px" }}
        data-ad-client="ca-pub-5469568210848543"
        data-ad-slot="3465314933"
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
