"use client";

import { Restaurant } from "@/types/restaurant";

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
}

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

const PRICE_COLOR: Record<string, string> = {
  "3-5만": "bg-green-100 text-green-800",
  "5-8만": "bg-blue-100 text-blue-800",
  "8만+": "bg-purple-100 text-purple-800",
};

export default function RestaurantCard({
  restaurant,
  isSelected,
  onClick,
}: RestaurantCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {CATEGORY_EMOJI[restaurant.category] ?? "🍴"}
            </span>
            <h3 className="font-bold text-gray-900 truncate">
              {restaurant.name}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRICE_COLOR[restaurant.priceRange]}`}
          >
            인당 {restaurant.priceRange}
          </span>
          <span className="text-xs text-gray-400">
            ~{restaurant.pricePerPerson.toLocaleString()}원 (참고)
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 mt-2">{restaurant.description}</p>

      <div className="mt-2 p-2 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          💡 <span className="font-medium">법카 팁:</span>{" "}
          {restaurant.recommendation}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
          ✅ {restaurant.licenseType}
        </span>
        <span className="text-xs text-gray-400">
          제보 {restaurant.reportCount}건
        </span>
      </div>

      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
        {restaurant.mapUrl ? (
          <a
            href={restaurant.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            지도에서 보기
          </a>
        ) : (
          <>
            <a
              href={`https://map.kakao.com/link/map/${encodeURIComponent(restaurant.name)},${restaurant.lat},${restaurant.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-1.5 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-lg hover:bg-yellow-500 transition-colors"
            >
              카카오맵
            </a>
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(restaurant.name)}?c=${restaurant.lng},${restaurant.lat},15,0,0,0,dh`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              네이버지도
            </a>
          </>
        )}
      </div>
    </button>
  );
}
