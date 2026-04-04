"use client";

import { useState } from "react";
import { useModalA11y } from "@/hooks/useModalA11y";
import { CONTACT_EMAIL } from "@/config/constants";

interface HeaderProps {
  onSubmitClick: () => void;
}

export default function Header({ onSubmitClick }: HeaderProps) {
  const [showContact, setShowContact] = useState(false);
  const contactModalRef = useModalA11y(showContact, () => setShowContact(false));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <h1 className="text-xl font-bold text-gray-900">법카맵</h1>
            <span className="text-xs text-gray-500 hidden sm:inline">
              내 돈 쓰긴 아깝지만, 법카로는 가볼 만한 곳 · 가격 정보는 참고용
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContact(true)}
              className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              문의
            </button>
            <button
              onClick={onSubmitClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              제보하기
            </button>
          </div>
        </div>
      </header>

      {showContact && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowContact(false)}
        >
          <div
            ref={contactModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="contact-title" className="text-lg font-bold text-gray-900">문의</h2>
              <button
                onClick={() => setShowContact(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                맛집 제보, 버그 신고, 제휴 문의 등 편하게 연락주세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
