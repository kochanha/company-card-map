import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "법카맵 - 법인카드로 갈 만한 맛집 지도",
  description:
    "내 돈 쓰긴 아깝지만, 법인카드로는 가볼 만한 곳. 적당히 비싸고 고급스러운 맛집을 지도에서 찾아보세요. 유흥주점 제외, 인허가 정보 확인 가능.",
  keywords: ["법인카드", "맛집", "회식", "법카", "접대", "고급 맛집"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
