import { PREFERENCE_CATEGORIES_ID, PREFERENCE_CATEGORIES_KEY } from "@/constants";

export type PreferenceCategoryId = (typeof PREFERENCE_CATEGORIES_ID)[keyof typeof PREFERENCE_CATEGORIES_ID];
export type PreferenceCategoryKey = (typeof PREFERENCE_CATEGORIES_KEY)[keyof typeof PREFERENCE_CATEGORIES_KEY];

export interface PreferenceCategoryPublicDTO {
  id: PreferenceCategoryId;
  key: PreferenceCategoryKey;
  display: string;
}

export interface PreferenceOptionPublicDTO {
  id: number;
  categoryId: PreferenceCategoryId;
  key: string;
  display: string;
}

export interface PreferencePublicDTO {
  id: string;
  userId: string;
  option: PreferenceOptionPublicDTO | null;
  category: PreferenceCategoryPublicDTO | null;
}
