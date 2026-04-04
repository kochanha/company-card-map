"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Restaurant } from "@/types/restaurant";

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (
          container: HTMLElement,
          options: {
            center: unknown;
            zoom: number;
            minZoom?: number;
            maxZoom?: number;
          },
        ) => NMap;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: {
          position: unknown;
          map: NMap;
          icon?: unknown;
        }) => NMarker;
        InfoWindow: new (options: {
          content: string;
          borderWidth?: number;
          borderColor?: string;
          backgroundColor?: string;
          anchorSize?: unknown;
          anchorSkew?: boolean;
          pixelOffset?: unknown;
        }) => NInfoWindow;
        Event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void,
          ) => void;
        };
        Point: new (x: number, y: number) => unknown;
        Size: new (w: number, h: number) => unknown;
      };
    };
  }
}

interface NMap {
  setCenter: (latlng: unknown) => void;
  setZoom: (zoom: number) => void;
  panTo: (latlng: unknown) => void;
}

interface NMarker {
  setMap: (map: NMap | null) => void;
}

interface NInfoWindow {
  open: (map: NMap, marker: NMarker) => void;
  close: () => void;
}

interface NaverMapProps {
  restaurants: readonly Restaurant[];
  selectedId: string | null;
  onSelectRestaurant: (id: string) => void;
}

const PRICE_MARKER_COLOR: Record<string, string> = {
  "3-5만": "#22c55e",
  "5-8만": "#3b82f6",
  "8만+": "#a855f7",
};

export default function NaverMap({
  restaurants,
  selectedId,
  onSelectRestaurant,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NMap | null>(null);
  const markersRef = useRef<NMarker[]>([]);
  const infoWindowRef = useRef<NInfoWindow | null>(null);
  const [mapStatus, setMapStatus] = useState<
    "loading" | "ready" | "error" | "no-key"
  >("loading");

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const hasKey = clientId && clientId !== "your_naver_client_id_here";

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.naver?.maps?.Map) return;

    const { maps } = window.naver;
    const center = new maps.LatLng(37.5665, 126.978);
    const map = new maps.Map(mapRef.current!, { center, zoom: 11 });
    mapInstanceRef.current = map;
    setMapStatus("ready");

    restaurants.forEach((r) => {
      const position = new maps.LatLng(r.lat, r.lng);
      const marker = new maps.Marker({ position, map });

      const infoContent = `
        <div style="padding:12px;max-width:260px;font-family:-apple-system,sans-serif;line-height:1.5;">
          <strong style="font-size:14px;color:#111;">${r.name}</strong>
          <p style="margin:4px 0 0;font-size:12px;color:#666;">${r.address}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#333;">${r.description}</p>
          <div style="margin-top:8px;padding:6px 8px;background:#fffbeb;border-radius:6px;">
            <p style="margin:0;font-size:11px;color:#92400e;">💡 ${r.recommendation}</p>
          </div>
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;color:#666;">✅ ${r.licenseType}</span>
            <span style="font-size:12px;font-weight:600;color:${PRICE_MARKER_COLOR[r.priceRange]};">인당 ${r.pricePerPerson.toLocaleString()}원</span>
          </div>
        </div>`;

      const infoWindow = new maps.InfoWindow({
        content: infoContent,
        borderWidth: 0,
        backgroundColor: "white",
        anchorSkew: true,
        pixelOffset: new maps.Point(0, -8),
      });

      maps.Event.addListener(marker, "click", () => {
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

    if (window.naver?.maps?.Map) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;

    const timeout = setTimeout(() => {
      setMapStatus("error");
    }, 8000);

    script.onload = () => {
      clearTimeout(timeout);
      initMap();
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
  }, [initMap, hasKey, clientId]);

  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const restaurant = restaurants.find((r) => r.id === selectedId);
    if (!restaurant || !window.naver?.maps) return;

    const center = new window.naver.maps.LatLng(restaurant.lat, restaurant.lng);
    mapInstanceRef.current.panTo(center);
    mapInstanceRef.current.setZoom(14);
  }, [selectedId, restaurants]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] bg-gray-100 relative"
    >
      {mapStatus !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
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
                  네이버맵 Client ID를 설정해주세요
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  .env.local 파일에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 입력하세요
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
                  Client ID 또는 도메인 설정을 확인해주세요
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
