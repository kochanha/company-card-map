/**
 * 승인된 제보를 restaurants.ts에 통합하는 스크립트
 * 실행: npx tsx scripts/sync-submissions.ts
 *
 * 1. Supabase에서 approved 제보 가져옴
 * 2. 지도 URL 기반으로 좌표/주소 조회
 * 3. Google 평점 조회
 * 4. restaurants.ts에 추가
 * 5. Supabase에서 status를 'synced'로 변경
 */

import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface SubmissionRow {
  id: string;
  name: string;
  category: string;
  price_range: string;
  price_per_person: number;
  description: string | null;
  recommendation: string | null;
  map_url: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── 카카오 검색 ──
async function searchKakao(
  name: string,
): Promise<PlaceResult | null> {
  const params = new URLSearchParams({
    query: name,
    category_group_code: "FD6",
    size: "1",
  });

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } },
  );

  if (!res.ok) return null;
  const data = await res.json();
  if (data.documents?.length > 0) {
    const p = data.documents[0];
    return {
      lat: parseFloat(p.y),
      lng: parseFloat(p.x),
      address: p.road_address_name || p.address_name || "",
      name: p.place_name || name,
      category: "",
    };
  }
  return null;
}

interface PlaceResult {
  lat: number;
  lng: number;
  address: string;
  name: string;
  category: string;
}

function naverCategoryToOurs(cat: string): string {
  if (cat.includes("일식") || cat.includes("초밥") || cat.includes("스시")) return "일식";
  if (cat.includes("중식") || cat.includes("중국")) return "중식";
  if (cat.includes("양식") || cat.includes("이탈리") || cat.includes("파스타") || cat.includes("스테이크")) return "양식";
  if (cat.includes("뷔페")) return "뷔페";
  if (cat.includes("프랑스") || cat.includes("프렌치")) return "파인다이닝";
  if (cat.includes("고기") || cat.includes("갈비") || cat.includes("구이") || cat.includes("한우") || cat.includes("육류") || cat.includes("삼겹")) return "고기/구이";
  if (cat.includes("해물") || cat.includes("횟집") || cat.includes("수산") || cat.includes("게요리")) return "해산물";
  return "한식";
}

// ── 네이버 URL에서 장소 정보 ──
async function fetchFromNaverUrl(
  url: string,
  name: string,
): Promise<PlaceResult | null> {
  const placeIdMatch = url.match(/place\/(\d+)/);
  if (placeIdMatch) {
    try {
      const res = await fetch(
        `https://map.naver.com/p/api/place/summary/${placeIdMatch[1]}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: "https://map.naver.com/",
          },
        },
      );
      if (res.ok) {
        const json = await res.json();
        const detail = json?.data?.placeDetail;
        if (detail?.coordinate) {
          return {
            lat: detail.coordinate.latitude,
            lng: detail.coordinate.longitude,
            address: detail.address?.roadAddress || detail.address?.address || "",
            name: detail.name || name,
            category: naverCategoryToOurs(detail.category?.category || ""),
          };
        }
      }
    } catch {}
  }

  if (url.includes("naver.me")) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      const finalUrl = res.url;
      const rePlaceId = finalUrl.match(/place\/(\d+)/);
      if (rePlaceId) return fetchFromNaverUrl(finalUrl, name);
    } catch {}
  }

  return searchKakao(name);
}

// ── URL 기반 장소 조회 ──
async function resolvePlace(
  url: string | null,
  name: string,
): Promise<PlaceResult | null> {
  if (!url) return searchKakao(name);

  if (url.includes("naver.com") || url.includes("naver.me")) {
    return fetchFromNaverUrl(url, name);
  }

  // 구글맵 좌표 추출
  if (url.includes("google.com") || url.includes("goo.gl") || url.includes("maps.app")) {
    const coordMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
        address: "",
        name,
        category: "",
      };
    }
    try {
      const res = await fetch(url, { redirect: "follow" });
      const rCoord = res.url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
      if (rCoord) {
        return {
          lat: parseFloat(rCoord[1]),
          lng: parseFloat(rCoord[2]),
          address: "",
          name,
          category: "",
        };
      }
    } catch {}
  }

  return searchKakao(name);
}

// ── 구글 평점 ──
async function fetchRating(name: string): Promise<number | null> {
  const params = new URLSearchParams({
    input: name,
    inputtype: "textquery",
    fields: "name,rating",
    key: GOOGLE_API_KEY,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.candidates?.[0]?.rating ?? null;
}

async function main() {
  // 1. 승인된 제보 가져오기
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*")
    .in("status", ["approved", "synced"]);

  if (error) {
    console.error("Supabase 조회 실패:", error.message);
    return;
  }

  if (!submissions || submissions.length === 0) {
    console.log("동기화할 승인된 제보가 없습니다.");
    return;
  }

  console.log(`${submissions.length}개 승인된 제보 처리 시작...`);

  // 2. 기존 데이터 읽기
  const existingData = fs.readFileSync("src/data/restaurants.ts", "utf-8");

  // 기존 ID 확인 (중복 방지)
  const existingIds = new Set(
    [...existingData.matchAll(/id: "sub-([^"]+)"/g)].map((m) => m[1]),
  );

  const newEntries: string[] = [];
  const syncedIds: string[] = [];

  for (const row of submissions as SubmissionRow[]) {
    if (existingIds.has(row.id)) {
      console.log(`  ⏭ "${row.name}" - 이미 동기화됨`);
      syncedIds.push(row.id);
      continue;
    }

    const place = await resolvePlace(row.map_url, row.name);
    if (!place) {
      console.log(`  ❌ "${row.name}" - 위치를 찾을 수 없음`);
      continue;
    }

    await sleep(100);
    const restaurantName = place.name || row.name;
    const rating = await fetchRating(restaurantName);
    await sleep(100);

    const recommendation = rating
      ? `구글 평점 ${rating}점 · ${row.recommendation ?? "사용자 제보 맛집"}`
      : row.recommendation ?? "사용자 제보 맛집";

    const entry = `  {
    id: "sub-${row.id}",
    name: "${restaurantName.replace(/"/g, '\\"')}",
    category: "${place.category || row.category}",
    priceRange: "${row.price_range}",
    pricePerPerson: ${row.price_per_person},
    address: "${place.address.replace(/"/g, '\\"')}",
    lat: ${place.lat},
    lng: ${place.lng},
    licenseType: "일반음식점",
    description: "${(row.description ?? "").replace(/"/g, '\\"')}",
    ${rating ? `rating: ${rating},\n    ` : ""}recommendation: "${recommendation.replace(/"/g, '\\"')}",
    reportCount: 1,
  }`;

    newEntries.push(entry);
    syncedIds.push(row.id);
    console.log(
      `  ✅ "${row.name}" - ${place.address} ${rating ? `(⭐${rating})` : ""}`,
    );
  }

  if (newEntries.length === 0) {
    console.log("\n추가할 새 식당이 없습니다.");
  } else {
    // 3. restaurants.ts에 추가
    const insertPoint = existingData.lastIndexOf("];");
    const updatedData =
      existingData.slice(0, insertPoint) +
      ",\n" +
      newEntries.join(",\n") +
      "\n" +
      existingData.slice(insertPoint);

    fs.writeFileSync("src/data/restaurants.ts", updatedData, "utf-8");
    console.log(`\n✅ ${newEntries.length}개 식당 추가 → src/data/restaurants.ts`);
  }

  // 4. 새로 처리한 것만 synced로 변경
  const newSyncIds = syncedIds.filter((id) => !existingIds.has(id));
  if (newSyncIds.length > 0) {
    const { error: updateError } = await supabase
      .from("submissions")
      .update({ status: "synced" })
      .in("id", newSyncIds);

    if (updateError) {
      console.log("⚠️ Supabase status 업데이트 실패 (RLS 권한 확인 필요)");
    } else {
      console.log(`✅ ${newSyncIds.length}개 제보 status → synced`);
    }
  }

  console.log("\n완료! npm run build 로 빌드하세요.");
}

main().catch(console.error);
