import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ) - 법카맵",
  description: "법카맵 서비스 이용 방법, 제보 방법, 가격 정보 안내 등 자주 묻는 질문 모음",
};

const FAQS = [
  {
    q: "법카맵은 어떤 서비스인가요?",
    a: "법카맵은 법인카드로 방문하기 좋은 고급 맛집을 지도에서 찾아볼 수 있는 서비스입니다. 내 돈 쓰긴 아깝지만 궁금했던 곳, 적당히 비싸면서 고급스럽고 맛있는 식당을 모아두었습니다. 유흥주점 같은 업종은 제외하고, 일반음식점과 휴게음식점만 표시합니다.",
  },
  {
    q: "어떤 지역을 지원하나요?",
    a: "현재 서울(강남, 역삼, 청담, 이태원, 여의도, 종로, 마포, 성수, 마곡, 영등포, 중랑, 노원), 인천(부평, 송도, 구월, 청라), 수원(인계동, 수원역, 광교, 영통), 성남(판교, 분당, 서현, 정자), 부산(해운대, 서면, 광안리, 남포동, 센텀시티)을 지원합니다. 추후 더 많은 지역이 추가될 예정입니다.",
  },
  {
    q: "가격 정보는 정확한가요?",
    a: "가격 정보는 Google Places API의 가격 수준(price_level) 데이터와 카테고리 기반 추정치입니다. 실제 가격과 차이가 있을 수 있으므로 참고 용도로만 활용해주세요. 정확한 가격은 식당에 직접 문의하거나 네이버/카카오 지도에서 메뉴를 확인하시는 것을 권장합니다.",
  },
  {
    q: "평점은 어디서 가져오나요?",
    a: "평점은 Google Places API에서 제공하는 구글 리뷰 평점입니다. 전체 1,950개 이상의 식당 중 약 95%에 평점 정보가 있습니다. 필터에서 4.0+ 또는 4.5+ 평점으로 검증된 맛집만 골라볼 수 있습니다.",
  },
  {
    q: "맛집을 제보하려면 어떻게 하나요?",
    a: "우측 상단의 '제보하기' 버튼을 누르면 제보 폼이 열립니다. 네이버지도 또는 카카오맵에서 식당을 검색한 뒤, 공유 링크를 복사해서 붙여넣으면 됩니다. 가격대와 법카 팁을 입력하면 제보가 완료됩니다. 관리자 검토 후 지도에 반영됩니다.",
  },
  {
    q: "제보한 식당은 언제 반영되나요?",
    a: "관리자가 제보를 확인하고 승인하면 자동으로 사이트에 반영됩니다. 보통 1~2일 내에 처리됩니다. 식당의 위치, 주소, 카테고리는 네이버 지도 API에서 자동으로 가져오며, 평점은 구글에서 보강합니다.",
  },
  {
    q: "카카오맵이나 네이버지도 링크는 어떻게 복사하나요?",
    a: "네이버지도 앱이나 웹에서 식당을 검색한 후, '공유' 버튼을 눌러 링크를 복사하면 됩니다. 카카오맵도 마찬가지로 식당 상세 페이지에서 공유 버튼을 통해 링크를 복사할 수 있습니다. 복사한 링크를 제보 폼에 붙여넣으세요.",
  },
  {
    q: "유흥주점은 왜 제외되나요?",
    a: "법인카드로 유흥주점(룸살롱, 나이트클럽 등) 결제는 세무 상 문제가 될 수 있으며, 많은 회사에서 명시적으로 금지하고 있습니다. 법카맵은 일반음식점과 휴게음식점으로 등록된 건전한 식당만 표시합니다.",
  },
  {
    q: "현재 위치 기반으로 볼 수 있나요?",
    a: "네, 사이트 접속 시 위치 권한을 허용하면 현재 위치를 중심으로 지도가 표시되고, 식당 목록도 가까운 순으로 정렬됩니다. 위치 권한을 거부하면 서울 중심으로 기본 표시됩니다.",
  },
  {
    q: "문의는 어떻게 하나요?",
    a: "상단의 '문의' 버튼을 클릭하면 이메일 주소를 확인할 수 있습니다. 맛집 제보, 버그 신고, 제휴 문의 등 편하게 연락해주세요.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span className="text-xl font-bold text-gray-900">법카맵</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/guide" className="text-gray-500 hover:text-gray-900">가이드</Link>
            <Link href="/regions" className="text-gray-500 hover:text-gray-900">지역별</Link>
            <Link href="/faq" className="text-blue-600 font-medium">FAQ</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">자주 묻는 질문</h1>
        <p className="text-gray-500 mb-10">법카맵 이용에 대해 궁금한 점을 확인하세요</p>

        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-xl">
              <h2 className="font-bold text-gray-900 mb-2">Q. {faq.q}</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-8 mt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">더 궁금한 점이 있으시면 문의해주세요.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            💳 법카 맛집 찾으러 가기
          </Link>
        </div>
      </main>
    </div>
  );
}
