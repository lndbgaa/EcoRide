import { PREFERENCE_CATEGORIES_ID, PREFERENCE_CATEGORIES_KEY } from "@/constants";

/* ===========================
    Constants-based Types
   =========================== */

export type PreferenceCategoryId = (typeof PREFERENCE_CATEGORIES_ID)[keyof typeof PREFERENCE_CATEGORIES_ID];
export type PreferenceCategoryKey = (typeof PREFERENCE_CATEGORIES_KEY)[keyof typeof PREFERENCE_CATEGORIES_KEY];

/* ===========================
           DTOs
   =========================== */

export interface PreferenceCategoryDTO {
  id: PreferenceCategoryId;
  key: PreferenceCategoryKey;
  display: string;
}

export interface PreferenceOptionDTO {
  id: number;
  category: PreferenceCategoryDTO | null;
  key: string;
  display: string;
}

export interface PreferenceDTO {
  id: string;
  option: PreferenceOptionDTO | null;
}
