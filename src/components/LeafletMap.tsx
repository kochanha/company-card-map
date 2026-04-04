"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Restaurant } from "@/types/restaurant";

interface LeafletMapProps {
  restaurants: readonly Restaurant[];
  selectedId: string | null;
  onSelectRestaurant: (id: string) => void;
}

const PRICE_MARKER_COLOR: Record<string, string> = {
  "3-5만": "#16a34a",
  "5-8만": "#2563eb",
  "8만+": "#9333ea",
};

const CATEGORY_EMOJI: Record<string, string> = {
  한식: "🍚",
  일식: "🍣",
  양식: "🍝",
  중식: "🥟",
  파인다이닝: "🍷",
  뷔페: "🍽️",
  "고기/구이": "🥩",
  해산물: "🦞",
};

/** 아이콘 캐시 — 동일 restaurant ID에 대해 divIcon을 재생성하지 않음 */
const iconCache = new Map<string, L.DivIcon>();

function getOrCreateIcon(restaurant: Restaurant): L.DivIcon {
  const cached = iconCache.get(restaurant.id);
  if (cached) return cached;

  const color = PRICE_MARKER_COLOR[restaurant.priceRange] ?? "#6b7280";
  const emoji = CATEGORY_EMOJI[restaurant.category] ?? "🍴";

  const icon = L.divIcon({
    className: "",
    html: `<div style="
      display:inline-flex;align-items:center;gap:3px;
      padding:5px 12px;
      background:${color};
      color:white;
      border-radius:20px;
      font-size:13px;
      font-weight:700;
      white-space:nowrap;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      border:2px solid white;
      cursor:pointer;
      transform:translate(-50%,-100%);
      letter-spacing:-0.3px;
    "><span style="font-size:14px;">${emoji}</span> ${restaurant.name}</div>
    <div style="
      width:10px;height:10px;
      background:${color};
      transform:translate(calc(50% - 5px),-6px) rotate(45deg);
      box-shadow:2px 2px 3px rgba(0,0,0,0.15);
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  iconCache.set(restaurant.id, icon);
  return icon;
}

function buildPopupContent(r: Restaurant): string {
  return `
    <div style="font-family:-apple-system,sans-serif;line-height:1.5;min-width:220px;">
      <strong style="font-size:15px;color:#111;">${r.name}</strong>
      <p style="margin:4px 0 0;font-size:12px;color:#666;">${r.address}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#333;">${r.description}</p>
      <div style="margin-top:8px;padding:6px 8px;background:#fffbeb;border-radius:6px;">
        <p style="margin:0;font-size:11px;color:#92400e;">💡 ${r.recommendation}</p>
      </div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#666;">✅ ${r.licenseType}</span>
        <span style="font-size:13px;font-weight:700;color:${PRICE_MARKER_COLOR[r.priceRange]};">인당 ${r.pricePerPerson.toLocaleString()}원</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px;">
        <a href="https://map.kakao.com/link/map/${encodeURIComponent(r.name)},${r.lat},${r.lng}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;padding:6px;background:#fde047;color:#713f12;font-size:11px;font-weight:600;border-radius:6px;text-decoration:none;">카카오맵</a>
        <a href="https://map.naver.com/v5/search/${encodeURIComponent(r.name)}?c=${r.lng},${r.lat},15,0,0,0,dh" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;padding:6px;background:#22c55e;color:white;font-size:11px;font-weight:600;border-radius:6px;text-decoration:none;">네이버지도</a>
      </div>
    </div>`;
}

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  let diameter = 36;
  if (count > 50) {
    diameter = 48;
  } else if (count > 20) {
    diameter = 42;
  }
  return L.divIcon({
    html: `<div style="
      width:${diameter}px;height:${diameter}px;
      background:rgba(234,88,12,0.9);
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:14px;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: "",
    iconSize: L.point(diameter, diameter),
  });
}

export default function LeafletMap({
  restaurants,
  selectedId,
  onSelectRestaurant,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const prevRestaurantIdsRef = useRef<Set<string>>(new Set());

  // restaurant ID set을 메모이제이션
  const restaurantIds = useMemo(
    () => new Set(restaurants.map((r) => r.id)),
    [restaurants],
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [37.5665, 126.978],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14, { animate: true });

          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            color: "white",
            weight: 3,
          })
            .addTo(map)
            .bindPopup("현재 위치");
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const prevIds = prevRestaurantIdsRef.current;
    const currentMarkers = markersMapRef.current;

    // 첫 로드 또는 클러스터가 없으면 전체 구성
    if (!clusterRef.current) {
      const cluster = L.markerClusterGroup({
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: createClusterIcon,
      });

      const newMarkersMap = new Map<string, L.Marker>();
      restaurants.forEach((r) => {
        const marker = L.marker([r.lat, r.lng], {
          icon: getOrCreateIcon(r),
        });
        marker.bindPopup(buildPopupContent(r), { maxWidth: 300 });
        marker.on("click", () => onSelectRestaurant(r.id));
        cluster.addLayer(marker);
        newMarkersMap.set(r.id, marker);
      });

      map.addLayer(cluster);
      clusterRef.current = cluster;
      markersMapRef.current = newMarkersMap;
      prevRestaurantIdsRef.current = restaurantIds;
      return;
    }

    // diff 기반 업데이트: 제거할 마커와 추가할 마커만 처리
    const cluster = clusterRef.current;

    // 제거: 이전에 있었지만 현재 없는 마커
    const toRemove: L.Marker[] = [];
    for (const prevId of prevIds) {
      if (!restaurantIds.has(prevId)) {
        const marker = currentMarkers.get(prevId);
        if (marker) {
          toRemove.push(marker);
          currentMarkers.delete(prevId);
        }
      }
    }
    if (toRemove.length > 0) {
      cluster.removeLayers(toRemove);
    }

    // 추가: 현재 있지만 이전에 없던 마커
    const toAdd: L.Marker[] = [];
    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));
    for (const id of restaurantIds) {
      if (!prevIds.has(id)) {
        const r = restaurantMap.get(id);
        if (!r) continue;
        const marker = L.marker([r.lat, r.lng], {
          icon: getOrCreateIcon(r),
        });
        marker.bindPopup(buildPopupContent(r), { maxWidth: 300 });
        marker.on("click", () => onSelectRestaurant(r.id));
        toAdd.push(marker);
        currentMarkers.set(r.id, marker);
      }
    }
    if (toAdd.length > 0) {
      cluster.addLayers(toAdd);
    }

    prevRestaurantIdsRef.current = restaurantIds;
  }, [restaurants, restaurantIds, onSelectRestaurant]);

  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current || !clusterRef.current) return;
    const marker = markersMapRef.current.get(selectedId);
    if (!marker) return;

    clusterRef.current.zoomToShowLayer(marker, () => {
      marker.openPopup();
    });
  }, [selectedId, restaurants]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px]" />;
}
