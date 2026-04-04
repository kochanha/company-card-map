import { describe, it, expect } from "vitest";
import { parseMapUrl, providerLabel } from "../map-url-parser";

describe("parseMapUrl", () => {
  describe("Naver Map URLs", () => {
    it("parses standard naver map place URL", () => {
      const result = parseMapUrl(
        "https://map.naver.com/p/entry/place/1234567890",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("naver");
        expect(result.result.placeId).toBe("1234567890");
      }
    });

    it("parses naver map search result URL", () => {
      const result = parseMapUrl(
        "https://map.naver.com/p/search/강남맛집/place/1234567890",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("naver");
        expect(result.result.placeId).toBe("1234567890");
      }
    });

    it("parses m.place.naver.com URL", () => {
      const result = parseMapUrl(
        "https://m.place.naver.com/restaurant/1234567890",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("naver");
        expect(result.result.placeId).toBe("1234567890");
      }
    });

    it("parses naver.me short URL", () => {
      const result = parseMapUrl("https://naver.me/abc123XYZ");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("naver");
        expect(result.result.placeId).toBe("");
      }
    });

    it("rejects naver map URL without place ID", () => {
      const result = parseMapUrl("https://map.naver.com/p/search/강남맛집");
      expect(result.ok).toBe(false);
    });
  });

  describe("Kakao Map URLs", () => {
    it("parses place.map.kakao.com URL", () => {
      const result = parseMapUrl("https://place.map.kakao.com/9876543210");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("kakao");
        expect(result.result.placeId).toBe("9876543210");
      }
    });

    it("parses kakao map itemId URL", () => {
      const result = parseMapUrl(
        "https://map.kakao.com/?itemId=9876543210",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("kakao");
        expect(result.result.placeId).toBe("9876543210");
      }
    });

    it("parses kko.to short URL", () => {
      const result = parseMapUrl("https://kko.to/abc123XYZ");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("kakao");
        expect(result.result.placeId).toBe("");
      }
    });

    it("parses kakao link/map URL", () => {
      const result = parseMapUrl(
        "https://map.kakao.com/link/map/맛집이름,37.123,127.456",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("kakao");
      }
    });
  });

  describe("URL extraction from text", () => {
    it("extracts URL from surrounding text", () => {
      const result = parseMapUrl(
        "이 식당 추천합니다 https://place.map.kakao.com/12345 정말 맛있어요",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.provider).toBe("kakao");
        expect(result.result.placeId).toBe("12345");
      }
    });

    it("handles whitespace around URL", () => {
      const result = parseMapUrl(
        "  https://map.naver.com/p/entry/place/999  ",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.placeId).toBe("999");
      }
    });
  });

  describe("invalid inputs", () => {
    it("rejects empty string", () => {
      const result = parseMapUrl("");
      expect(result.ok).toBe(false);
    });

    it("rejects whitespace only", () => {
      const result = parseMapUrl("   ");
      expect(result.ok).toBe(false);
    });

    it("rejects plain text without URL", () => {
      const result = parseMapUrl("그냥 텍스트입니다");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("유효한 URL");
      }
    });

    it("rejects non-map URLs", () => {
      const result = parseMapUrl("https://google.com/maps/place/123");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("네이버지도 또는 카카오맵");
      }
    });
  });
});

describe("providerLabel", () => {
  it("returns Korean label for naver", () => {
    expect(providerLabel("naver")).toBe("네이버지도");
  });

  it("returns Korean label for kakao", () => {
    expect(providerLabel("kakao")).toBe("카카오맵");
  });
});
