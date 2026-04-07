"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdBanner from "@/components/AdBanner";

interface Review {
  id: string;
  created_at: string;
  restaurant_name: string;
  content: string;
  rating: number;
  price_per_person: number | null;
  nickname: string;
}

interface ReviewFormData {
  restaurant_name: string;
  content: string;
  rating: number;
  price_per_person: string;
  nickname: string;
}

function sanitize(str: string): string {
  return str.replace(/[<>]/g, "");
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${
            n <= value ? "text-amber-400" : "text-gray-300 hover:text-amber-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatPrice(price: number | null): string {
  if (price == null) return "";
  return price.toLocaleString("ko-KR") + "원";
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormData>({
    restaurant_name: "",
    content: "",
    rating: 5,
    price_per_person: "",
    nickname: "",
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setReviews(data as Review[]);
      }
    } catch {
      // graceful: supabase may not be configured
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const restaurant_name = sanitize(form.restaurant_name.trim());
    const content = sanitize(form.content.trim());
    const nickname = sanitize(form.nickname.trim()) || "익명";
    const price_per_person = form.price_per_person
      ? parseInt(form.price_per_person.replace(/,/g, ""), 10) || null
      : null;

    if (!restaurant_name) {
      setSubmitError("식당 이름을 입력해주세요.");
      return;
    }
    if (!content) {
      setSubmitError("후기 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        restaurant_name,
        content,
        rating: form.rating,
        price_per_person,
        nickname,
      });
      if (error) {
        setSubmitError("후기 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setForm({
          restaurant_name: "",
          content: "",
          rating: 5,
          price_per_person: "",
          nickname: "",
        });
        setShowForm(false);
        await fetchReviews();
      }
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span className="text-xl font-bold text-gray-900">법카맵</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/guide" className="text-gray-500 hover:text-gray-900">
              가이드
            </Link>
            <Link href="/regions" className="text-gray-500 hover:text-gray-900">
              지역별
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-900">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">법카 후기 게시판</h1>
            <p className="text-gray-500 mt-1">법카로 다녀온 식당 후기를 공유해보세요</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 ml-4 mt-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "닫기" : "후기 쓰기"}
          </button>
        </div>

        {showForm && (
          <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">후기 작성</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    식당 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.restaurant_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, restaurant_name: e.target.value }))
                    }
                    placeholder="식당 이름을 입력하세요"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={form.nickname}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nickname: e.target.value }))
                    }
                    placeholder="익명"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    별점
                  </label>
                  <StarInput
                    value={form.rating}
                    onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    인당 가격 (원)
                  </label>
                  <input
                    type="number"
                    value={form.price_per_person}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price_per_person: e.target.value }))
                    }
                    placeholder="예: 50000"
                    min={0}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  후기 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="법카로 방문한 솔직한 후기를 남겨주세요"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  maxLength={1000}
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "등록 중..." : "후기 등록"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 mb-6">
          <AdBanner />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 bg-gray-50 rounded-xl animate-pulse h-28"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-sm">아직 후기가 없습니다. 첫 번째 후기를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">
                      {review.restaurant_name}
                    </span>
                    <StarDisplay rating={review.rating} />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
                  <span>{review.nickname || "익명"}</span>
                  {review.price_per_person != null && (
                    <>
                      <span>·</span>
                      <span>인당 {formatPrice(review.price_per_person)}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-8 mt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            💳 법카 맛집 찾으러 가기
          </Link>
        </div>
      </main>
    </div>
  );
}
