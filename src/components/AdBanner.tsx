"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner() {
  const adRef = useRef<HTMLModElement>(null);
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-center">
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: "block", width: "100%", height: "60px" }}
        data-ad-client="ca-pub-5469568210848543"
        data-ad-slot=""
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
