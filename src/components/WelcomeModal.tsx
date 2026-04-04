"use client";

import { useState } from "react";
import { useModalA11y } from "@/hooks/useModalA11y";

const DISMISSED_KEY = "lawkamap_welcome_dismissed";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently ignore localStorage errors (e.g. incognito mode)
  }
}

function shouldShowWelcome(): boolean {
  const dismissedAt = safeGetItem(DISMISSED_KEY);
  if (!dismissedAt) return true;
  return Date.now() - parseInt(dismissedAt, 10) > ONE_DAY_MS;
}

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(shouldShowWelcome);

  const handleClose = () => {
    setIsOpen(false);
    safeSetItem(DISMISSED_KEY, Date.now().toString());
  };

  const modalRef = useModalA11y(isOpen, handleClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <p className="text-3xl mb-2">💳</p>
          <h2 id="welcome-title" className="text-xl font-bold">법카맵에 오신 걸 환영합니다!</h2>
          <p className="text-sm text-blue-100 mt-1">
            내 돈 쓰긴 아깝지만, 법카로는 가볼 만한 곳
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <span className="text-lg shrink-0">📍</span>
            <div>
              <p className="text-sm font-medium text-gray-900">지원 지역</p>
              <p className="text-sm text-gray-600">
                서울, 인천, 수원, 성남, 부산 지원 중이며 추후 지역 추가 예정이에요.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg shrink-0">💰</span>
            <div>
              <p className="text-sm font-medium text-gray-900">가격 정보 안내</p>
              <p className="text-sm text-gray-600">
                가격은 리뷰 데이터 기반의 대략적인 참고 정보입니다. 정확한 가격은 식당에 직접 확인해주세요.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg shrink-0">🙌</span>
            <div>
              <p className="text-sm font-medium text-gray-900">제보 환영</p>
              <p className="text-sm text-gray-600">
                법카로 가볼 만한 곳을 알고 계시면 네이버지도 링크로 제보해주세요!
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            24시간 동안 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
