export type PriceRange = "3-5만" | "5-8만" | "8만+";

export type Category =
  | "한식"
  | "일식"
  | "양식"
  | "중식"
  | "파인다이닝"
  | "뷔페"
  | "고기/구이"
  | "해산물";

export type LicenseType = "일반음식점" | "휴게음식점" | "제과점영업";

export interface Restaurant {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  readonly priceRange: PriceRange;
  readonly pricePerPerson: number;
  readonly address: string;
  readonly lat: number;
  readonly lng: number;
  readonly licenseType: LicenseType;
  readonly description: string;
  readonly recommendation: string;
  readonly imageUrl?: string;
  readonly naverMapUrl?: string;
  readonly mapUrl?: string;
  readonly rating?: number;
  readonly reportCount: number;
  readonly isSubmission?: boolean;
}
