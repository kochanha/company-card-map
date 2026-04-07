import type { Metadata } from "next";
import Link from "next/link";
import { restaurants } from "@/data/restaurants";

export const metadata: Metadata = {
  title: "지역별 법카 맛집 - 법카맵",
  description: "서울, 인천, 수원, 성남, 부산 지역별 법인카드 맛집 추천. 가격대별, 카테고리별 정리.",
};

function getRegionStats() {
  const regions: Record<string, { count: number; categories: Record<string, number>; avgPrice: number }> = {};

  const regionMap: Record<string, string> = {
    "서울": "서울",
    "인천": "인천",
    "수원": "수원",
    "성남": "성남",
    "분당": "성남",
    "판교": "성남",
    "부산": "부산",
  };

  for (const r of restaurants) {
    let region = "기타";
    for (const [keyword, name] of Object.entries(regionMap)) {
      if (r.address.includes(keyword)) {
        region = name;
        break;
      }
    }

    if (!regions[region]) {
      regions[region] = { count: 0, categories: {}, avgPrice: 0 };
    }
    regions[region].count++;
    regions[region].categories[r.category] = (regions[region].categories[r.category] || 0) + 1;
    regions[region].avgPrice += r.pricePerPerson;
  }

  for (const region of Object.values(regions)) {
    region.avgPrice = Math.round(region.avgPrice / region.count);
  }

  return regions;
}

const REGION_DESCRIPTIONS: Record<string, string> = {
  "서울": "강남, 역삼, 청담, 이태원, 여의도, 종로, 마포, 성수, 마곡, 영등포, 중랑, 노원 등 서울 전역의 법인카드 맛집을 찾아보세요. 오마카세, 파인다이닝부터 고급 한정식까지 다양한 선택지가 있습니다.",
  "인천": "부평, 송도, 구월, 청라 등 인천 주요 지역의 법카 맛집입니다. 송도 센트럴파크 주변 레스토랑과 부평 맛집거리가 인기입니다.",
  "수원": "인계동, 수원역, 광교, 영통 등 수원 지역 법카 맛집. 광교 신도시의 새로운 레스토랑과 수원 전통 맛집을 확인해보세요.",
  "성남": "판교, 분당, 서현, 정자 등 성남 지역 법카 맛집. IT 기업이 밀집한 판교 테크노밸리 주변 식당이 특히 인기입니다.",
  "부산": "해운대, 서면, 광안리, 남포동, 센텀시티 등 부산 주요 지역의 법카 맛집. 신선한 해산물 코스와 부산만의 특색 있는 레스토랑을 만나보세요.",
};

const REGION_EMOJI: Record<string, string> = {
  "서울": "🏙️",
  "인천": "🌊",
  "수원": "🏯",
  "성남": "💻",
  "부산": "🐟",
};

export default function RegionsPage() {
  const stats = getRegionStats();
  const orderedRegions = ["서울", "부산", "인천", "성남", "수원"];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span className="text-xl font-bold text-gray-900">법카맵</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/guide" className="text-gray-500 hover:text-gray-900">가이드</Link>
            <Link href="/regions" className="text-blue-600 font-medium">지역별</Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-900">FAQ</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">지역별 법카 맛집</h1>
        <p className="text-gray-500 mb-10">총 {restaurants.length.toLocaleString()}개 식당 | 서울 · 인천 · 수원 · 성남 · 부산</p>

        <div className="space-y-10">
          {orderedRegions.map((region) => {
            const data = stats[region];
            if (!data) return null;

            const topCategories = Object.entries(data.categories)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            return (
              <section key={region} className="p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {REGION_EMOJI[region]} {region}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{data.count}개 식당 | 평균 인당 {data.avgPrice.toLocaleString()}원</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {REGION_DESCRIPTIONS[region]}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {topCategories.map(([cat, count]) => (
                    <span key={cat} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                      {cat} {count}곳
                    </span>
                  ))}
                </div>

                <Link
                  href="/"
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  지도에서 {region} 맛집 보기 →
                </Link>
              </section>
            );
          })}
        </div>

        <div className="text-center pt-8 mt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">추후 더 많은 지역이 추가될 예정입니다.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            💳 지도에서 찾아보기
          </Link>
        </div>
      </main>
    </div>
  );
}
