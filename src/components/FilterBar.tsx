"use client";

import { Category, PriceRange } from "@/types/restaurant";

const CATEGORIES: readonly Category[] = [
  "한식",
  "일식",
  "양식",
  "중식",
  "파인다이닝",
  "뷔페",
  "고기/구이",
  "해산물",
];

const PRICE_RANGES: readonly PriceRange[] = ["3-5만", "5-8만", "8만+"];

const RATING_FILTERS = [
  { label: "4.5+", min: 4.5 },
  { label: "4.0+", min: 4.0 },
  { label: "3.5+", min: 3.5 },
];

interface FilterBarProps {
  selectedCategory: Category | null;
  selectedPriceRange: PriceRange | null;
  selectedMinRating: number | null;
  onCategoryChange: (category: Category | null) => void;
  onPriceRangeChange: (priceRange: PriceRange | null) => void;
  onMinRatingChange: (minRating: number | null) => void;
}

export default function FilterBar({
  selectedCategory,
  selectedPriceRange,
  selectedMinRating,
  onCategoryChange,
  onPriceRangeChange,
  onMinRatingChange,
}: FilterBarProps) {
  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
      <div className="max-w-screen-xl mx-auto flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onPriceRangeChange(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedPriceRange === null
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체 가격
        </button>
        {PRICE_RANGES.map((range) => (
          <button
            key={range}
            onClick={() =>
              onPriceRangeChange(
                selectedPriceRange === range ? null : range,
              )
            }
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedPriceRange === range
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {range}
          </button>
        ))}

        <span className="shrink-0 w-px bg-gray-300" />

        <button
          onClick={() => onMinRatingChange(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedMinRating === null
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체 평점
        </button>
        {RATING_FILTERS.map((rf) => (
          <button
            key={rf.label}
            onClick={() =>
              onMinRatingChange(
                selectedMinRating === rf.min ? null : rf.min,
              )
            }
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedMinRating === rf.min
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⭐{rf.label}
          </button>
        ))}

        <span className="shrink-0 w-px bg-gray-300" />

        <button
          onClick={() => onCategoryChange(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === null
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              onCategoryChange(selectedCategory === cat ? null : cat)
            }
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
