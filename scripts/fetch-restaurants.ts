/**
 * 카카오 Local API로 법카 맛집 데이터를 가져오는 스크립트
 * 실행: npx tsx scripts/fetch-restaurants.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY!;

// 검색 키워드 - 법카로 갈 만한 고급 식당 키워드
const SEARCH_KEYWORDS = [
  "오마카세",
  "파인다이닝",
  "한정식",
  "스테이크하우스",
  "호텔 뷔페",
  "고급 일식",
  "고급 한식",
  "고급 중식",
  "고급 양식",
  "코스 요리",
  "와인바 레스토랑",
  "해산물 코스",
  "한우 오마카세",
  "이탈리안 레스토랑",
  "프렌치 레스토랑",
];

// 주요 지역 (위도, 경도)
const AREAS = [
  // 서울
  { name: "강남", x: "127.0276", y: "37.4979" },
  { name: "역삼", x: "127.0365", y: "37.5007" },
  { name: "청담", x: "127.0473", y: "37.5248" },
  { name: "이태원", x: "126.9946", y: "37.5345" },
  { name: "여의도", x: "126.9245", y: "37.5219" },
  { name: "종로", x: "126.9769", y: "37.5759" },
  { name: "광화문", x: "126.9769", y: "37.5759" },
  { name: "서초", x: "127.0292", y: "37.4923" },
  { name: "잠실", x: "127.1001", y: "37.5133" },
  { name: "마포", x: "126.9246", y: "37.5665" },
  { name: "을지로", x: "126.9910", y: "37.5660" },
  { name: "성수", x: "127.0560", y: "37.5445" },
  { name: "마곡", x: "126.8372", y: "37.5595" },
  { name: "영등포", x: "126.8983", y: "37.5171" },
  { name: "중랑", x: "127.0928", y: "37.5953" },
  { name: "노원", x: "127.0565", y: "37.6542" },
  // 인천
  { name: "인천 부평", x: "126.7218", y: "37.5074" },
  { name: "인천 송도", x: "126.6567", y: "37.3830" },
  { name: "인천 구월", x: "126.7052", y: "37.4482" },
  { name: "인천 청라", x: "126.6398", y: "37.5275" },
  // 수원
  { name: "수원 인계동", x: "127.0286", y: "37.2636" },
  { name: "수원역", x: "127.0015", y: "37.2660" },
  { name: "수원 광교", x: "127.0435", y: "37.2925" },
  { name: "수원 영통", x: "127.0560", y: "37.2506" },
  // 성남
  { name: "성남 판교", x: "127.1115", y: "37.3948" },
  { name: "성남 분당", x: "127.1209", y: "37.3780" },
  { name: "성남 서현", x: "127.1240", y: "37.3850" },
  { name: "성남 정자", x: "127.1085", y: "37.3670" },
  // 부산
  { name: "부산 해운대", x: "129.1604", y: "35.1631" },
  { name: "부산 서면", x: "129.0595", y: "35.1580" },
  { name: "부산 광안리", x: "129.1186", y: "35.1533" },
  { name: "부산 남포동", x: "129.0275", y: "35.0981" },
  { name: "부산 센텀시티", x: "129.1296", y: "35.1695" },
  { name: "부산 전포", x: "129.0640", y: "35.1530" },
];

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
}

interface KakaoResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

// 유흥주점 관련 카테고리 필터
const EXCLUDED_CATEGORIES = [
  "유흥주점",
  "노래방",
  "나이트클럽",
  "룸살롱",
  "단란주점",
  "바(BAR)",
  "호프",
  "포장마차",
];

function isExcludedCategory(categoryName: string): boolean {
  return EXCLUDED_CATEGORIES.some((excluded) =>
    categoryName.includes(excluded),
  );
}

type Category =
  | "한식"
  | "일식"
  | "양식"
  | "중식"
  | "파인다이닝"
  | "뷔페"
  | "고기/구이"
  | "해산물";

function categorize(categoryName: string, placeName: string): Category {
  const combined = `${categoryName} ${placeName}`;
  if (combined.includes("뷔페")) return "뷔페";
  if (combined.includes("파인다이닝") || combined.includes("프렌치") || combined.includes("프랑스"))
    return "파인다이닝";
  if (combined.includes("일식") || combined.includes("초밥") || combined.includes("스시") || combined.includes("오마카세"))
    return "일식";
  if (combined.includes("중식") || combined.includes("중국")) return "중식";
  if (
    combined.includes("양식") ||
    combined.includes("이탈리") ||
    combined.includes("스테이크") ||
    combined.includes("파스타")
  )
    return "양식";
  if (combined.includes("고기") || combined.includes("구이") || combined.includes("한우") || combined.includes("소고기"))
    return "고기/구이";
  if (combined.includes("해산물") || combined.includes("회") || combined.includes("수산") || combined.includes("킹크랩"))
    return "해산물";
  if (combined.includes("한식") || combined.includes("한정식") || combined.includes("정식"))
    return "한식";
  return "양식";
}

async function searchKakao(
  query: string,
  x?: string,
  y?: string,
  page = 1,
): Promise<KakaoResponse> {
  const params = new URLSearchParams({
    query,
    category_group_code: "FD6",
    size: "15",
    page: String(page),
    sort: "accuracy",
  });
  if (x && y) {
    params.set("x", x);
    params.set("y", y);
    params.set("radius", "5000");
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Kakao API error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PriceRange = "3-5만" | "5-8만" | "8만+";

function estimatePrice(
  categoryName: string,
  placeName: string,
  keyword: string,
): { priceRange: PriceRange; pricePerPerson: number } {
  const combined = `${categoryName} ${placeName} ${keyword}`.toLowerCase();

  // 8만+ : 파인다이닝, 프렌치, 미쉐린, 호텔 뷔페, 청담/압구정 오마카세
  if (
    combined.includes("파인다이닝") ||
    combined.includes("프렌치") ||
    combined.includes("프랑스") ||
    combined.includes("미쉐린") ||
    (combined.includes("호텔") && combined.includes("뷔페"))
  ) {
    const prices = [85000, 90000, 95000, 100000, 120000];
    return { priceRange: "8만+", pricePerPerson: prices[Math.floor(Math.random() * prices.length)] };
  }

  // 5-8만 : 오마카세, 스테이크, 한정식, 코스, 고급
  if (
    combined.includes("오마카세") ||
    combined.includes("스테이크") ||
    combined.includes("한정식") ||
    combined.includes("코스") ||
    combined.includes("한우")
  ) {
    const prices = [50000, 55000, 60000, 65000, 70000, 75000];
    return { priceRange: "5-8만", pricePerPerson: prices[Math.floor(Math.random() * prices.length)] };
  }

  // 3-5만 : 나머지 (이탈리안, 일반 일식, 중식 등)
  const prices = [30000, 35000, 40000, 45000, 50000];
  return { priceRange: "3-5만", pricePerPerson: prices[Math.floor(Math.random() * prices.length)] };
}

interface RestaurantData {
  id: string;
  name: string;
  category: Category;
  priceRange: PriceRange;
  pricePerPerson: number;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  licenseType: "일반음식점";
  kakaoUrl: string;
  categoryDetail: string;
  searchKeyword: string;
}

async function main() {
  const seen = new Set<string>();
  const restaurants: RestaurantData[] = [];

  for (const keyword of SEARCH_KEYWORDS) {
    for (const area of AREAS) {
      const query = `${area.name} ${keyword}`;
      try {
        const data = await searchKakao(query, area.x, area.y);

        for (const place of data.documents) {
          if (seen.has(place.id)) continue;
          if (place.category_group_code !== "FD6") continue;
          if (isExcludedCategory(place.category_name)) continue;

          seen.add(place.id);
          const price = estimatePrice(place.category_name, place.place_name, keyword);
          restaurants.push({
            id: place.id,
            name: place.place_name,
            category: categorize(place.category_name, place.place_name),
            priceRange: price.priceRange,
            pricePerPerson: price.pricePerPerson,
            address: place.road_address_name || place.address_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            phone: place.phone,
            licenseType: "일반음식점",
            kakaoUrl: place.place_url,
            categoryDetail: place.category_name,
            searchKeyword: keyword,
          });
        }

        // API 호출 간격
        await sleep(200);
      } catch (err) {
        console.error(`Error for "${query}":`, err);
        await sleep(1000);
      }
    }
    console.log(
      `[${keyword}] 완료 - 누적 ${restaurants.length}개`,
    );
  }

  // 결과를 TypeScript 파일로 저장
  const output = `import { Restaurant } from "@/types/restaurant";

// 카카오 Local API에서 가져온 데이터 (${new Date().toISOString().split("T")[0]})
// 총 ${restaurants.length}개 식당
export const restaurants: readonly Restaurant[] = [
${restaurants
  .map(
    (r) => `  {
    id: "${r.id}",
    name: "${r.name.replace(/"/g, '\\"')}",
    category: "${r.category}",
    priceRange: "${r.priceRange}",
    pricePerPerson: ${r.pricePerPerson},
    address: "${r.address.replace(/"/g, '\\"')}",
    lat: ${r.lat},
    lng: ${r.lng},
    licenseType: "${r.licenseType}",
    description: "${r.categoryDetail.replace(/"/g, '\\"')}",
    recommendation: "법카로 방문 추천",
    reportCount: 0,
  }`,
  )
  .join(",\n")}
];
`;

  const fs = await import("fs");
  fs.writeFileSync("src/data/restaurants.ts", output, "utf-8");
  console.log(`\n✅ ${restaurants.length}개 식당 데이터 저장 완료 → src/data/restaurants.ts`);
}

main().catch(console.error);
