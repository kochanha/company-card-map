/**
 * 법카 컨셉에 안 맞는 저가 식당을 제거하는 스크립트
 * 실행: npx tsx scripts/cleanup-restaurants.ts
 */

import * as fs from "fs";

// 법카와 안 맞는 저가 키워드
const CHEAP_KEYWORDS = [
  "청국장", "김밥", "분식", "백반", "국밥", "칼국수",
  "떡볶이", "순대", "라면", "우동", "돈까스", "돈가스",
  "김치찌개", "된장찌개", "제육", "덮밥", "도시락",
  "빵집", "베이커리", "카페", "커피", "디저트",
  "치킨", "피자", "햄버거", "맥도날드", "버거킹",
  "패스트푸드", "편의점", "푸드코트",
  "선술집", "포차", "호프", "이자카야",
];

// 고급 키워드 (이 키워드가 포함되면 유지)
const PREMIUM_KEYWORDS = [
  "오마카세", "파인다이닝", "코스", "한정식",
  "스테이크하우스", "스테이크", "뷔페",
  "미쉐린", "레스토랑", "다이닝",
];

function main() {
  const source = fs.readFileSync("src/data/restaurants.ts", "utf-8");

  // 각 엔트리 파싱
  const headerMatch = source.match(/^[\s\S]*?export const restaurants: readonly Restaurant\[\] = \[\n/);
  if (!headerMatch) {
    console.error("파일 형식을 인식할 수 없습니다.");
    return;
  }
  const header = headerMatch[0];

  // 개별 엔트리 추출
  const entries = [...source.matchAll(/  \{[\s\S]*?  \}/g)].map((m) => m[0]);
  console.log(`총 ${entries.length}개 식당 분석 중...`);

  let removedCheap = 0;
  let removedLowPrice = 0;
  let kept = 0;

  const filtered = entries.filter((entry) => {
    const nameMatch = entry.match(/name: "([^"]+)"/);
    const name = nameMatch?.[1] ?? "";
    const descMatch = entry.match(/description: "([^"]+)"/);
    const desc = descMatch?.[1] ?? "";
    const combined = `${name} ${desc}`.toLowerCase();

    // 제보 식당은 유지
    if (entry.includes('id: "sub-')) {
      kept++;
      return true;
    }

    // 고급 키워드가 이름에 포함되면 무조건 유지
    const isPremium = PREMIUM_KEYWORDS.some((kw) => combined.includes(kw));
    if (isPremium) {
      kept++;
      return true;
    }

    // 저가 키워드가 이름에 포함되면 제거
    const isCheap = CHEAP_KEYWORDS.some((kw) => combined.includes(kw));
    if (isCheap) {
      removedCheap++;
      console.log(`  ❌ "${name}" - 저가 키워드`);
      return false;
    }

    // pricePerPerson이 25000 이하면 제거 (법카 최소 3만원대)
    const priceMatch = entry.match(/pricePerPerson: (\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
    if (price > 0 && price < 25000) {
      removedLowPrice++;
      console.log(`  ❌ "${name}" - 가격 ${price}원`);
      return false;
    }

    kept++;
    return true;
  });

  // 파일 재생성
  const output = `${header}${filtered.join(",\n")}\n];\n`;
  fs.writeFileSync("src/data/restaurants.ts", output, "utf-8");

  console.log(`\n✅ 정리 완료`);
  console.log(`   - 유지: ${kept}개`);
  console.log(`   - 저가 키워드 제거: ${removedCheap}개`);
  console.log(`   - 저가격 제거: ${removedLowPrice}개`);
  console.log(`   - 최종: ${filtered.length}개`);
}

main();
