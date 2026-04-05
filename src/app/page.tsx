"use client";

import { useState, useMemo, useEffect } from "react";
import { Category, PriceRange, Restaurant } from "@/types/restaurant";
import { restaurants as allRestaurants } from "@/data/restaurants";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-100 flex items-center justify-center">
      <p className="text-4xl animate-pulse">🗺️</p>
    </div>
  ),
});
import RestaurantCard from "@/components/RestaurantCard";
import SubmitModal from "@/components/SubmitModal";
import WelcomeModal from "@/components/WelcomeModal";
import AdBanner from "@/components/AdBanner";
import MapErrorBoundary from "@/components/MapErrorBoundary";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [showList, setShowList] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 640 : true,
  );
  const [visibleCount, setVisibleCount] = useState(30);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  }, []);

  const filteredRestaurants = useMemo(() => {
    const filtered = allRestaurants.filter((r: Restaurant) => {
      if (selectedCategory && r.category !== selectedCategory) return false;
      if (selectedPriceRange && r.priceRange !== selectedPriceRange)
        return false;
      if (selectedMinRating && (!r.rating || r.rating < selectedMinRating))
        return false;
      return true;
    });

    if (userLocation) {
      return [...filtered].sort((a, b) => {
        const distA = (a.lat - userLocation.lat) ** 2 + (a.lng - userLocation.lng) ** 2;
        const distB = (b.lat - userLocation.lat) ** 2 + (b.lng - userLocation.lng) ** 2;
        return distA - distB;
      });
    }

    return filtered;
  }, [allRestaurants, selectedCategory, selectedPriceRange, selectedMinRating, userLocation]);

  return (
    <div className="fixed inset-0 flex flex-col">
      <Header onSubmitClick={() => setIsSubmitOpen(true)} />
      <FilterBar
        selectedCategory={selectedCategory}
        selectedPriceRange={selectedPriceRange}
        selectedMinRating={selectedMinRating}
        onCategoryChange={(c) => { setSelectedCategory(c); setVisibleCount(30); }}
        onPriceRangeChange={(p) => { setSelectedPriceRange(p); setVisibleCount(30); }}
        onMinRatingChange={(r) => { setSelectedMinRating(r); setVisibleCount(30); }}
      />

      {/* Main content area */}
      <div className="flex-1 min-h-0 mt-[6rem] relative">
          {/* Map - always full width */}
          <div className="absolute inset-0">
            <MapErrorBoundary>
              <LeafletMap
                restaurants={filteredRestaurants}
                selectedId={selectedRestaurantId}
                onSelectRestaurant={setSelectedRestaurantId}
              />
            </MapErrorBoundary>
          </div>

          {/* Pull tab handle - floats on map edge */}
          <button
            onClick={() => setShowList(!showList)}
            className={`absolute top-1/2 -translate-y-1/2 z-30 w-6 h-16 bg-white/90 backdrop-blur-sm border border-r-0 border-gray-300 rounded-l-lg shadow-md flex items-center justify-center hover:bg-white transition-all duration-300 ${
              showList ? "right-full sm:right-[400px]" : "right-0"
            }`}
            style={{ right: showList ? undefined : 0 }}
          >
            <span className="text-gray-500 text-sm font-bold">{showList ? "›" : "‹"}</span>
          </button>

          {/* Restaurant list sidebar - overlays on map */}
          <div
            className={`absolute top-0 right-0 bottom-0 z-20 overflow-y-auto bg-gray-50 border-l border-gray-200 transition-all duration-300 ${
              showList ? "w-full sm:w-[400px]" : "w-0 border-l-0 overflow-hidden"
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500">
                  {filteredRestaurants.length}개의 법카 맛집
                </h2>
                <button
                  onClick={() => setShowList(false)}
                  className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <AdBanner />
                {filteredRestaurants.slice(0, visibleCount).map((restaurant: Restaurant, index: number) => (
                  <div key={restaurant.id}>
                    <RestaurantCard
                      restaurant={restaurant}
                      isSelected={selectedRestaurantId === restaurant.id}
                      onClick={() => setSelectedRestaurantId(restaurant.id)}
                    />
                    {index === 4 && <div className="py-2"><AdBanner /></div>}
                  </div>
                ))}
                {filteredRestaurants.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-gray-500 text-sm">
                      조건에 맞는 식당이 없습니다
                    </p>
                  </div>
                )}
                {visibleCount < filteredRestaurants.length && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 30)}
                    className="w-full py-3 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    더 보기 ({filteredRestaurants.length - visibleCount}개 남음)
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>

      <WelcomeModal />
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </div>
  );
}
