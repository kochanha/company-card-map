"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";
import { restaurants } from "@/data/restaurants";
import AdBanner from "@/components/AdBanner";
import type { Category } from "@/types/restaurant";

// metadata cannot be exported from a "use client" component in Next.js,
// so we handle SEO via a separate layout or just omit it here.
// The page is interactive-first, so "use client" takes precedence.

const CATEGORIES: Category[] = [
  "한식",
  "일식",
  "양식",
  "중식",
  "파인다이닝",
  "뷔페",
  "고기/구이",
  "해산물",
];

const CATEGORY_EMOJI: Record<Category, string> = {
  한식: "🍚",
  일식: "🍱",
  양식: "🥩",
  중식: "🥢",
  파인다이닝: "🍽️",
  뷔페: "🍴",
  "고기/구이": "🔥",
  해산물: "🦞",
};

function formatWon(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 1)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export default function CalculatorPage() {
  const [headcount, setHeadcount] = useState(4);
  const [limitPerPerson, setLimitPerPerson] = useState(50000);

  const totalBudget = headcount * limitPerPerson;

  const filteredByCategory = useMemo(() => {
    const eligible = restaurants.filter(
      (r) => r.pricePerPerson <= limitPerPerson
    );

    const grouped: Partial<Record<Category, typeof eligible>> = {};
    for (const r of eligible) {
      if (!grouped[r.category]) {
        grouped[r.category] = [];
      }
      grouped[r.category]!.push(r);
    }
    return grouped;
  }, [limitPerPerson]);

  const totalCount = useMemo(
    () =>
      Object.values(filteredByCategory).reduce(
        (sum, arr) => sum + (arr?.length ?? 0),
        0
      ),
    [filteredByCategory]
  );

  function decrementHeadcount() {
    setHeadcount((prev) => Math.max(1, prev - 1));
  }

  function incrementHeadcount() {
    setHeadcount((prev) => Math.min(20, prev + 1));
  }

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLimitPerPerson(Number(e.target.value));
  }

  function handleHeadcountInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setHeadcount(Math.min(20, Math.max(1, val)));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span className="text-xl font-bold text-gray-900">법카맵</span>
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/guide" className="text-gray-500 hover:text-gray-900">
              가이드
            </Link>
            <Link href="/regions" className="text-gray-500 hover:text-gray-900">
              지역별
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-900">
              FAQ
            </Link>
            <Link
              href="/calculator"
              className="text-blue-600 font-medium"
            >
              계산기
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          법카 한도 계산기
        </h1>
        <p className="text-gray-500 mb-8">
          인원수와 인당 한도를 설정하면 방문 가능한 식당을 바로 알려드립니다
        </p>

        {/* 입력 영역 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 인원수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                인원수
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementHeadcount}
                  disabled={headcount <= 1}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-xl font-bold text-gray-700 flex items-center justify-center transition-colors"
                  aria-label="인원 줄이기"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={headcount}
                  onChange={handleHeadcountInput}
                  className="w-16 text-center text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={incrementHeadcount}
                  disabled={headcount >= 20}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-xl font-bold text-gray-700 flex items-center justify-center transition-colors"
                  aria-label="인원 늘리기"
                >
                  +
                </button>
                <span className="text-gray-500 text-sm">명 (최대 20명)</span>
              </div>
            </div>

            {/* 인당 한도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                인당 한도{" "}
                <span className="text-blue-600 font-bold">
                  {formatWon(limitPerPerson)}
                </span>
              </label>
              <input
                type="range"
                min={20000}
                max={150000}
                step={5000}
                value={limitPerPerson}
                onChange={handleLimitChange}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2만원</span>
                <span>15만원</span>
              </div>
            </div>
          </div>

          {/* 총 예산 */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                총 예산 ({headcount}명 × {formatWon(limitPerPerson)})
              </span>
              <span className="text-2xl font-bold text-amber-600">
                {formatWon(totalBudget)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              인당 {formatWon(limitPerPerson)} 이하 식당 {totalCount}개 검색됨
            </p>
          </div>
        </div>

        {/* AdSense */}
        <div className="mb-6">
          <AdBanner />
        </div>

        {/* 결과 영역 */}
        {totalCount === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">😅</div>
            <p className="text-lg font-medium">해당 한도로 갈 수 있는 식당이 없습니다</p>
            <p className="text-sm mt-2">인당 한도를 올려보세요</p>
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map((category) => {
              const list = filteredByCategory[category];
              if (!list || list.length === 0) return null;
              return (
                <section key={category}>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[category]}</span>
                    <span>{category}</span>
                    <span className="text-sm font-normal text-gray-400">
                      {list.length}곳
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {list.map((restaurant) => {
                      const kakaoUrl = `https://map.kakao.com/link/search/${encodeURIComponent(restaurant.name)}`;
                      const naverUrl =
                        restaurant.naverMapUrl ??
                        `https://map.naver.com/p/search/${encodeURIComponent(restaurant.name)}`;
                      return (
                        <div
                          key={restaurant.id}
                          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                              {restaurant.name}
                            </h3>
                            <span className="shrink-0 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              {formatWon(restaurant.pricePerPerson)}~
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                            {restaurant.address}
                          </p>
                          {restaurant.rating && (
                            <p className="text-xs text-amber-600 mb-2">
                              ⭐ {restaurant.rating.toFixed(1)}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <a
                              href={kakaoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center text-xs py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium transition-colors"
                            >
                              카카오맵
                            </a>
                            <a
                              href={naverUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center text-xs py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                            >
                              네이버지도
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="text-center pt-10 mt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            💳 지도에서 법카 맛집 찾기
          </Link>
        </div>
      </main>
    </div>
  );
}
