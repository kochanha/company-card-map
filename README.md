# 법카맵 💳

> 내 돈 쓰긴 아깝지만, 법인카드로는 가볼 만한 곳

법인카드로 갈 만한 고급 맛집을 지도에서 찾아보는 서비스입니다.

**[https://companycard.vercel.app](https://companycard.vercel.app)**

## 주요 기능

- **지도 기반 탐색** - 1,700+ 식당을 지도에서 한눈에 확인
- **필터링** - 가격대(3-5만/5-8만/8만+), 카테고리(한식/일식/양식 등), 구글 평점
- **현재 위치** - 접속 시 내 주변 맛집부터 표시
- **식당 공유** - 카카오맵/네이버지도 링크로 바로 이동
- **제보 시스템** - 네이버지도 링크로 간편 제보, 관리자 승인 후 자동 반영

## 지원 지역

서울 | 인천 | 수원 | 성남 | 부산 (추후 확대 예정)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Map | Leaflet + OpenStreetMap |
| Database | Supabase (제보 관리) |
| Data | 카카오 Local API (식당 수집), Google Places API (평점) |
| Deploy | Vercel |

## 데이터 파이프라인

```
카카오 API로 식당 수집 → Google API로 평점 보강 → 정적 데이터 생성
                                                        ↓
사용자 제보 → Supabase → 관리자 승인 → 빌드 시 자동 통합 → 배포
```

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local에 API 키 입력

# 프로덕션 빌드 & 실행
npm run build && npm start
```

### 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `KAKAO_REST_KEY` | 카카오 REST API 키 |
| `GOOGLE_API_KEY` | Google Places API 키 |

## 스크립트

```bash
# 식당 데이터 수집 (카카오 API)
npm run sync       # 승인된 제보 동기화

npx tsx scripts/fetch-restaurants.ts      # 식당 수집
npx tsx scripts/enrich-with-google.ts     # 구글 평점 보강
npx tsx scripts/cleanup-restaurants.ts    # 저가 식당 제거
```

## 라이선스

MIT
