import { PREFERENCE_CATEGORIES_ID, PREFERENCE_CATEGORIES_KEY } from "@/constants";

// ===========================
//    Constants-based Types
// =========================== */

export type PreferenceCategoryId = (typeof PREFERENCE_CATEGORIES_ID)[keyof typeof PREFERENCE_CATEGORIES_ID];
export type PreferenceCategoryKey = (typeof PREFERENCE_CATEGORIES_KEY)[keyof typeof PREFERENCE_CATEGORIES_KEY];

// ===========================
//           DTOs
// =========================== */

export interface PreferenceCategoryPrivateDTO {
  id: PreferenceCategoryId;
  key: PreferenceCategoryKey;
  display: string;
}

export interface PreferenceOptionPublicDTO {
  display: string;
}

export interface PreferenceOptionPrivateDTO {
  id: number;
  category: PreferenceCategoryPrivateDTO | null;
  key: string;
  display: string;
}

export interface PreferencePublicDTO {
  option: PreferenceOptionPublicDTO | null;
}

export interface PreferencePrivateDTO {
  id: string;
  option: PreferenceOptionPrivateDTO | null;
}
