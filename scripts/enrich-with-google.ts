/**
 * Google Places API로 price_level, rating 보강
 * 실행: npx tsx scripts/enrich-with-google.ts
 */

import * as fs from "fs";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

interface GoogleCandidate {
  name: string;
  price_level?: number;
  rating?: number;
}

interface GoogleResponse {
  candidates: GoogleCandidate[];
  status: string;
}

type PriceRange = "3-5만" | "5-8만" | "8만+";

function priceLevelToRange(level: number): { priceRange: PriceRange; pricePerPerson: number } {
  switch (level) {
    case 4:
      return { priceRange: "8만+", pricePerPerson: [85000, 95000, 100000, 120000][Math.floor(Math.random() * 4)] };
    case 3:
      return { priceRange: "5-8만", pricePerPerson: [50000, 55000, 60000, 65000, 70000][Math.floor(Math.random() * 5)] };
    case 2:
      return { priceRange: "3-5만", pricePerPerson: [30000, 35000, 40000, 45000][Math.floor(Math.random() * 4)] };
    default:
      return { priceRange: "3-5만", pricePerPerson: [30000, 35000, 40000][Math.floor(Math.random() * 3)] };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchGoogle(name: string, address: string): Promise<GoogleCandidate | null> {
  const query = `${name} ${address.split(" ").slice(0, 3).join(" ")}`;
  const params = new URLSearchParams({
    input: query,
    inputtype: "textquery",
    fields: "name,price_level,rating",
    key: GOOGLE_API_KEY,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`,
  );

  if (!res.ok) return null;

  const data: GoogleResponse = await res.json();
  if (data.status === "OK" && data.candidates.length > 0) {
    return data.candidates[0];
  }
  return null;
}

async function main() {
  const source = fs.readFileSync("src/data/restaurants.ts", "utf-8");

  // 식당 데이터 파싱 (간단한 정규식)
  const entries = [...source.matchAll(/\{[^}]+id: "(\d+)"[^}]+name: "([^"]+)"[^}]+priceRange: "([^"]+)"[^}]+pricePerPerson: (\d+)[^}]+address: "([^"]+)"[^}]+/g)];

  console.log(`총 ${entries.length}개 식당 처리 시작...`);

  let enriched = 0;
  let withPrice = 0;
  let withRating = 0;

  const updates: Map<string, { priceRange?: string; pricePerPerson?: number; rating?: number }> = new Map();

  for (let i = 0; i < entries.length; i++) {
    const [, id, name, , , address] = entries[i];

    try {
      const result = await searchGoogle(name, address);

      if (result) {
        const update: { priceRange?: string; pricePerPerson?: number; rating?: number } = {};

        if (result.price_level !== undefined && result.price_level >= 2) {
          const price = priceLevelToRange(result.price_level);
          update.priceRange = price.priceRange;
          update.pricePerPerson = price.pricePerPerson;
          withPrice++;
        }

        if (result.rating !== undefined) {
          update.rating = result.rating;
          withRating++;
        }

        if (Object.keys(update).length > 0) {
          updates.set(id, update);
          enriched++;
        }
      }

      // 진행상황 표시 (50개마다)
      if ((i + 1) % 50 === 0) {
        console.log(`[${i + 1}/${entries.length}] 처리중... (가격: ${withPrice}, 평점: ${withRating})`);
      }

      // API rate limit 방지
      await sleep(100);
    } catch (err) {
      console.error(`Error for ${name}:`, err);
      await sleep(500);
    }
  }

  console.log(`\n조회 완료: 가격 ${withPrice}개, 평점 ${withRating}개 보강`);

  // 기존 파일 업데이트
  let updated = source;

  // rating 필드를 Restaurant 타입에 이미 없으므로, description에 평점 추가
  for (const [id, update] of updates) {
    if (update.priceRange && update.pricePerPerson) {
      // priceRange 교체
      const priceRangeRegex = new RegExp(`(id: "${id}"[\\s\\S]*?priceRange: ")[^"]+"`);
      updated = updated.replace(priceRangeRegex, `$1${update.priceRange}"`);

      // pricePerPerson 교체
      const pricePerPersonRegex = new RegExp(`(id: "${id}"[\\s\\S]*?pricePerPerson: )\\d+`);
      updated = updated.replace(pricePerPersonRegex, `$1${update.pricePerPerson}`);
    }

    if (update.rating) {
      // recommendation에 평점 추가
      const recRegex = new RegExp(`(id: "${id}"[\\s\\S]*?recommendation: ")법카로 방문 추천"`);
      updated = updated.replace(recRegex, `$1구글 평점 ${update.rating}점 · 법카로 방문 추천"`);
    }
  }

  fs.writeFileSync("src/data/restaurants.ts", updated, "utf-8");
  console.log(`✅ src/data/restaurants.ts 업데이트 완료`);
  console.log(`   - 가격 보정: ${withPrice}개 (Google price_level 기반)`);
  console.log(`   - 평점 추가: ${withRating}개`);
  console.log(`   - 변경 없음: ${entries.length - enriched}개 (기존 추정 유지)`);
}

main().catch(console.error);
