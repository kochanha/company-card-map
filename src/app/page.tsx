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
  const [showList, setShowList] = useState(false);
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
    <div className="h-full flex flex-col">
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
      <div className="flex-1 min-h-0 pt-[6rem] relative">
        {/* Mobile toggle */}
        <div className="sm:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setShowList(!showList)}
            className="px-6 py-3 bg-gray-900 text-white rounded-full shadow-lg text-sm font-medium"
          >
            {showList ? "🗺️ 지도 보기" : `📋 목록 보기 (${filteredRestaurants.length})`}
          </button>
        </div>

        <div className="h-full flex">
          {/* Map */}
          <div
            className={`flex-1 relative ${showList ? "hidden sm:block" : "block"}`}
          >
            <MapErrorBoundary>
              <LeafletMap
                restaurants={filteredRestaurants}
                selectedId={selectedRestaurantId}
                onSelectRestaurant={setSelectedRestaurantId}
              />
            </MapErrorBoundary>
            <div className="hidden sm:block absolute bottom-16 left-1/2 -translate-x-1/2 z-[500] w-[468px]">
              <AdBanner />
            </div>
          </div>

          {/* Restaurant list sidebar */}
          <div
            className={`w-full sm:w-[400px] sm:border-l border-gray-200 overflow-y-auto bg-gray-50 ${
              showList ? "block" : "hidden sm:block"
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500">
                  {filteredRestaurants.length}개의 법카 맛집
                </h2>
              </div>
              <div className="space-y-3">
                {filteredRestaurants.slice(0, visibleCount).map((restaurant: Restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={selectedRestaurantId === restaurant.id}
                    onClick={() => setSelectedRestaurantId(restaurant.id)}
                  />
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
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[500] h-[50px] bg-white/90 border-t border-gray-200">
        <AdBanner />
      </div>
      <WelcomeModal />
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </div>
  );
}
