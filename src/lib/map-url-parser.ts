export type MapProvider = "naver" | "kakao";

export interface ParsedMapUrl {
  readonly provider: MapProvider;
  readonly placeId: string;
  readonly originalUrl: string;
}

// 네이버맵 URL 패턴들
// - https://map.naver.com/p/entry/place/1234567890
// - https://map.naver.com/p/search/.../place/1234567890
// - https://naver.me/xxxxx (단축 URL)
// - https://m.place.naver.com/restaurant/1234567890
const NAVER_PATTERNS: readonly RegExp[] = [
  /https?:\/\/map\.naver\.com\/.*place\/(\d+)/,
  /https?:\/\/m\.place\.naver\.com\/(?:restaurant|place)\/(\d+)/,
  /https?:\/\/naver\.me\/\w+/,
];

// 카카오맵 URL 패턴들
// - https://map.kakao.com/link/map/식당이름,37.123,127.123
// - https://place.map.kakao.com/1234567890
// - https://kko.to/xxxxx (단축 URL)
// - https://map.kakao.com/?itemId=1234567890
const KAKAO_PATTERNS: readonly RegExp[] = [
  /https?:\/\/place\.map\.kakao\.com\/(\d+)/,
  /https?:\/\/map\.kakao\.com\/.*(?:\?|&)itemId=(\d+)/,
  /https?:\/\/map\.kakao\.com\/link\/(?:map|to)\/[^,]+,[\d.]+,[\d.]+/,
  /https?:\/\/kko\.to\/\w+/,
];

function extractNaverPlaceId(url: string): string | null {
  // 일반 URL에서 place ID 추출
  const placeMatch = url.match(/place\/(\d+)/);
  if (placeMatch) return placeMatch[1];

  // m.place.naver.com/restaurant/ID 패턴
  const mPlaceMatch = url.match(
    /m\.place\.naver\.com\/(?:restaurant|place)\/(\d+)/,
  );
  if (mPlaceMatch) return mPlaceMatch[1];

  return null;
}

function extractKakaoPlaceId(url: string): string | null {
  // place.map.kakao.com/ID 패턴
  const placeMatch = url.match(/place\.map\.kakao\.com\/(\d+)/);
  if (placeMatch) return placeMatch[1];

  // itemId 쿼리 파라미터
  const itemIdMatch = url.match(/(?:\?|&)itemId=(\d+)/);
  if (itemIdMatch) return itemIdMatch[1];

  return null;
}

function isNaverUrl(url: string): boolean {
  return NAVER_PATTERNS.some((pattern) => pattern.test(url));
}

function isKakaoUrl(url: string): boolean {
  return KAKAO_PATTERNS.some((pattern) => pattern.test(url));
}

/** 텍스트에서 URL을 추출합니다 */
function extractUrl(text: string): string | null {
  const urlMatch = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
  return urlMatch ? urlMatch[0] : null;
}

/**
 * 어떤 텍스트가 들어오든 URL을 추출하고,
 * 네이버맵 또는 카카오맵 식당 링크인지 검증합니다.
 */
export function parseMapUrl(
  input: string,
): { ok: true; result: ParsedMapUrl } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "링크를 입력해주세요." };
  }

  const url = extractUrl(trimmed);
  if (!url) {
    return {
      ok: false,
      error:
        "유효한 URL을 찾을 수 없습니다. 네이버지도 또는 카카오맵의 식당 링크를 붙여넣어주세요.",
    };
  }

  // 네이버맵 확인
  if (isNaverUrl(url)) {
    // 단축 URL (naver.me)은 place ID 없이도 허용 — 서버에서 resolve
    const isShortUrl = /naver\.me/.test(url);
    const placeId = extractNaverPlaceId(url);

    if (!placeId && !isShortUrl) {
      return {
        ok: false,
        error:
          "네이버지도 링크이지만 식당 페이지가 아닌 것 같습니다. 식당 상세 페이지의 공유 링크를 붙여넣어주세요.",
      };
    }

    return {
      ok: true,
      result: {
        provider: "naver",
        placeId: placeId ?? "",
        originalUrl: url,
      },
    };
  }

  // 카카오맵 확인
  if (isKakaoUrl(url)) {
    const isShortUrl = /kko\.to/.test(url);
    const placeId = extractKakaoPlaceId(url);

    if (!placeId && !isShortUrl) {
      // link/map/ 패턴은 좌표 기반이므로 place ID 없이 허용
      const isLinkMap = /map\.kakao\.com\/link\//.test(url);
      if (!isLinkMap) {
        return {
          ok: false,
          error:
            "카카오맵 링크이지만 식당 페이지가 아닌 것 같습니다. 식당 상세 페이지의 공유 링크를 붙여넣어주세요.",
        };
      }
    }

    return {
      ok: true,
      result: {
        provider: "kakao",
        placeId: placeId ?? "",
        originalUrl: url,
      },
    };
  }

  return {
    ok: false,
    error:
      "네이버지도 또는 카카오맵 링크만 지원합니다. 식당의 공유 링크를 붙여넣어주세요.",
  };
}

/** provider 한글명 */
export function providerLabel(provider: MapProvider): string {
  return provider === "naver" ? "네이버지도" : "카카오맵";
}
