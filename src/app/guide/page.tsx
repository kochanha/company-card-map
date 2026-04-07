import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "법카 사용 가이드 - 법카맵",
  description: "법인카드로 식당 갈 때 알아두면 좋은 팁과 한도별 추천 식당 가이드",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span className="text-xl font-bold text-gray-900">법카맵</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/guide" className="text-blue-600 font-medium">가이드</Link>
            <Link href="/regions" className="text-gray-500 hover:text-gray-900">지역별</Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-900">FAQ</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">법인카드 사용 가이드</h1>
        <p className="text-gray-500 mb-10">법카로 식당 갈 때 알아두면 좋은 모든 것</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">법인카드란?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            법인카드는 회사(법인) 명의로 발급되는 신용카드로, 업무 관련 경비를 처리할 때 사용합니다.
            식대, 접대비, 회의비 등 업무 목적의 지출에 사용할 수 있으며, 대부분의 회사에서 인당 한도를 설정하고 있습니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            법카맵은 이런 법인카드로 방문하기 좋은 식당을 모아둔 서비스입니다.
            내 돈 쓰긴 아깝지만 궁금했던 곳, 적당히 고급스러우면서 한도 내에서 즐길 수 있는 곳을 찾아보세요.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">회사별 인당 한도 가이드</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            회사마다 법인카드 사용 한도가 다릅니다. 일반적으로 아래와 같은 범위를 가집니다.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-bold text-green-800 mb-2">인당 3~5만원</h3>
              <p className="text-sm text-green-700">
                가장 흔한 한도 범위입니다. 점심 식사나 간단한 팀 회식에 적합합니다.
                오마카세 런치 코스, 고급 한식 백반, 프리미엄 텐동 등을 즐길 수 있습니다.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">인당 5~8만원</h3>
              <p className="text-sm text-blue-700">
                팀 저녁 회식이나 외부 미팅에 적합한 범위입니다.
                스테이크 코스, 오마카세 디너, 한정식, 호텔 뷔페 등 다양한 선택지가 있습니다.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-2">인당 8만원 이상</h3>
              <p className="text-sm text-purple-700">
                임원급 회식이나 중요한 접대 자리에 사용됩니다.
                파인다이닝, 프렌치 코스, 미쉐린 레스토랑 등 최상위 식당을 방문할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">법인카드 사용 시 주의사항</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-lg shrink-0">1.</span>
              <div>
                <h3 className="font-medium text-gray-900">인허가 유형 확인</h3>
                <p className="text-sm text-gray-600">
                  유흥주점, 단란주점 등으로 등록된 업소는 법인카드 사용이 제한될 수 있습니다.
                  법카맵에서는 일반음식점, 휴게음식점만 표시합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg shrink-0">2.</span>
              <div>
                <h3 className="font-medium text-gray-900">영수증 보관</h3>
                <p className="text-sm text-gray-600">
                  법인카드 사용 후 반드시 영수증을 보관하세요. 경비 처리 시 필요합니다.
                  참석자 명단과 식사 목적도 기록해두면 좋습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg shrink-0">3.</span>
              <div>
                <h3 className="font-medium text-gray-900">주류 한도</h3>
                <p className="text-sm text-gray-600">
                  많은 회사에서 주류비에 별도 한도를 두고 있습니다. 와인이나 주류 주문 전에 회사 정책을 확인하세요.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg shrink-0">4.</span>
              <div>
                <h3 className="font-medium text-gray-900">주말/공휴일 사용</h3>
                <p className="text-sm text-gray-600">
                  일부 회사는 주말이나 공휴일 법인카드 사용에 제한을 둡니다. 사전에 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">법카맵 활용 팁</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-gray-700">
                <strong>가격 필터</strong>를 활용하세요. 회사 한도에 맞는 식당만 골라볼 수 있습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-gray-700">
                <strong>평점 4.5+</strong> 필터로 검증된 맛집만 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-gray-700">
                <strong>네이버지도/카카오맵 링크</strong>로 바로 이동해서 예약 정보를 확인하세요.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-gray-700">
                좋은 식당을 알고 계시면 <strong>제보하기</strong>로 공유해주세요. 검토 후 지도에 반영됩니다.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8 border-t border-gray-200">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            💳 법카 맛집 찾으러 가기
          </Link>
        </div>
      </main>
    </div>
  );
}
