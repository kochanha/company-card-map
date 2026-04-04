/** Google AdSense publisher ID */
export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_ID ?? "ca-pub-5469568210848543";

/** Google AdSense ad slot ID */
export const ADSENSE_AD_SLOT = "3465314933";

/** Default map center coordinates (Seoul City Hall) */
export const DEFAULT_MAP_CENTER = {
  lat: 37.5665,
  lng: 126.978,
} as const;

/** Default map zoom level */
export const DEFAULT_MAP_ZOOM = 12;

/** Contact email */
export const CONTACT_EMAIL = "kochanha@gmail.com";
