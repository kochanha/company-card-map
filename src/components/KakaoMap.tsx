"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Restaurant } from "@/types/restaurant";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number },
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: {
          map: KakaoMap;
          position: unknown;
        }) => KakaoMarker;
        InfoWindow: new (options: {
          content: string;
          removable?: boolean;
        }) => KakaoInfoWindow;
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void,
          ) => void;
        };
      };
    };
  }
}

interface KakaoMap {
  setCenter: (latlng: unknown) => void;
  setLevel: (level: number) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
}

interface KakaoMapProps {
  restaurants: readonly Restaurant[];
  selectedId: string | null;
  onSelectRestaurant: (id: string) => void;
}

const PRICE_MARKER_COLOR: Record<string, string> = {
  "3-5만": "#22c55e",
  "5-8만": "#3b82f6",
  "8만+": "#a855f7",
};

export default function KakaoMap({
  restaurants,
  selectedId,
  onSelectRestaurant,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const [mapStatus, setMapStatus] = useState<
    "loading" | "ready" | "error" | "no-key"
  >("loading");

  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const hasKey = kakaoKey && kakaoKey !== "your_kakao_js_key_here";

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao?.maps?.Map) return;

    const { maps } = window.kakao;
    const center = new maps.LatLng(37.5665, 126.978);
    const map = new maps.Map(mapRef.current!, { center, level: 8 });
    mapInstanceRef.current = map;
    setMapStatus("ready");

    restaurants.forEach((r) => {
      const position = new maps.LatLng(r.lat, r.lng);
      const marker = new maps.Marker({ map, position });

      const infoContent = `
        <div style="padding:12px;max-width:250px;font-family:sans-serif;">
          <strong style="font-size:14px;">${r.name}</strong>
          <p style="margin:4px 0;font-size:12px;color:#666;">${r.address}</p>
          <p style="margin:4px 0;font-size:12px;color:#333;">${r.description}</p>
          <div style="margin-top:6px;padding:6px;background:#fffbeb;border-radius:6px;">
            <p style="font-size:11px;color:#92400e;">💡 ${r.recommendation}</p>
          </div>
          <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;color:#666;">✅ ${r.licenseType}</span>
            <span style="font-size:12px;font-weight:600;color:${PRICE_MARKER_COLOR[r.priceRange]};">인당 ${r.pricePerPerson.toLocaleString()}원</span>
          </div>
        </div>`;

      const infoWindow = new maps.InfoWindow({
        content: infoContent,
        removable: true,
      });

      maps.event.addListener(marker, "click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
        onSelectRestaurant(r.id);
      });

      markersRef.current = [...markersRef.current, marker];
    });
  }, [restaurants, onSelectRestaurant]);

  useEffect(() => {
    if (!hasKey) {
      setMapStatus("no-key");
      return;
    }

    if (window.kakao?.maps?.Map) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
    script.async = true;

    const timeout = setTimeout(() => {
      setMapStatus("error");
    }, 5000);

    script.onload = () => {
      clearTimeout(timeout);
      window.kakao.maps.load(() => {
        initMap();
      });
    };

    script.onerror = () => {
      clearTimeout(timeout);
      setMapStatus("error");
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeout);
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [initMap, hasKey, kakaoKey]);

  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const restaurant = restaurants.find((r) => r.id === selectedId);
    if (!restaurant || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(
      restaurant.lat,
      restaurant.lng,
    );
    mapInstanceRef.current.setCenter(center);
    mapInstanceRef.current.setLevel(5);
  }, [selectedId, restaurants]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] bg-gray-100 relative"
    >
      {mapStatus !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            {mapStatus === "loading" && (
              <>
                <p className="text-4xl mb-4 animate-pulse">🗺️</p>
                <p className="text-sm text-gray-500">지도 로딩 중...</p>
              </>
            )}
            {mapStatus === "no-key" && (
              <>
                <p className="text-6xl mb-4">🗺️</p>
                <p className="text-lg font-medium text-gray-700">
                  카카오맵 API 키를 설정해주세요
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  .env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_KEY를 입력하세요
                </p>
              </>
            )}
            {mapStatus === "error" && (
              <>
                <p className="text-6xl mb-4">⚠️</p>
                <p className="text-lg font-medium text-gray-700">
                  지도를 불러올 수 없습니다
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  API 키 또는 도메인 설정을 확인해주세요
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
