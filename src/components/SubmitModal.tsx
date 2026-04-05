"use client";

import { useState } from "react";
import { PriceRange } from "@/types/restaurant";
import { supabase } from "@/lib/supabase";
import { useModalA11y } from "@/hooks/useModalA11y";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  readonly mapUrl: string;
  readonly priceRange: PriceRange;
  readonly pricePerPerson: string;
  readonly recommendation: string;
}

const INITIAL_FORM: FormData = {
  mapUrl: "",
  priceRange: "3-5만",
  pricePerPerson: "",
  recommendation: "",
};

const NAVER_URL_PATTERN =
  /^https?:\/\/(map\.naver\.com|naver\.me)/;

export default function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const modalRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUrlPaste = async (url: string) => {
    updateField("mapUrl", url);
    setPlaceName(null);

    if (!NAVER_URL_PATTERN.test(url)) return;

    // place ID 추출
    const match = url.match(/place\/(\d+)/);
    if (!match) return;

    try {
      const res = await fetch(
        `https://map.naver.com/p/api/place/summary/${match[1]}`,
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
        if (detail?.name) {
          setPlaceName(detail.name);
        }
      }
    } catch {
      // 미리보기 실패해도 제보는 가능
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!form.mapUrl || !NAVER_URL_PATTERN.test(form.mapUrl)) {
      setError("네이버지도 링크를 입력해주세요.");
      setSubmitting(false);
      return;
    }

    if (!form.mapUrl.match(/place\/(\d+)/)) {
      setError("식당의 네이버지도 링크가 아닌 것 같습니다. 식당 페이지의 공유 링크를 붙여넣어주세요.");
      setSubmitting(false);
      return;
    }

    const pricePerPerson = parseInt(form.pricePerPerson, 10);
    if (Number.isNaN(pricePerPerson) || pricePerPerson <= 0) {
      setError("올바른 인당 가격을 입력해주세요.");
      setSubmitting(false);
      return;
    }

    const sanitizedRecommendation = form.recommendation
      .slice(0, 500)
      .replace(/[<>]/g, "");

    const { error: dbError } = await supabase.from("submissions").insert({
      name: placeName || "제보 식당",
      category: "한식",
      price_range: form.priceRange,
      price_per_person: pricePerPerson,
      recommendation: sanitizedRecommendation || null,
      map_url: form.mapUrl,
    });

    setSubmitting(false);

    if (dbError) {
      setError("제보 저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(INITIAL_FORM);
      setPlaceName(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {submitted ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-xl font-bold text-gray-900">제보 완료!</p>
            <p className="text-sm text-gray-500 mt-2">
              검토 후 지도에 반영됩니다
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 id="submit-title" className="text-lg font-bold text-gray-900">
                💳 법카 맛집 제보
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  네이버지도 링크 *
                </label>
                <input
                  type="url"
                  required
                  value={form.mapUrl}
                  onChange={(e) => handleUrlPaste(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://map.naver.com/p/entry/place/..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  네이버지도 앱/웹에서 식당 검색 → 공유 → 링크 복사
                </p>
                {placeName && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ {placeName}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가격대 *
                  </label>
                  <select
                    value={form.priceRange}
                    onChange={(e) =>
                      updateField("priceRange", e.target.value as PriceRange)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="3-5만">인당 3-5만</option>
                    <option value="5-8만">인당 5-8만</option>
                    <option value="8만+">인당 8만+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    인당 가격 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.pricePerPerson}
                    onChange={(e) =>
                      updateField("pricePerPerson", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 55000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  법카 팁 💡
                </label>
                <textarea
                  value={form.recommendation}
                  onChange={(e) =>
                    updateField("recommendation", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="법카로 갈 때 꿀팁을 알려주세요 (예: 런치 코스가 한도에 딱 맞음)"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "제보 중..." : "제보하기"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
