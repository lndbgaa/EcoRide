import type { Includeable } from "sequelize";

export const PREFERENCE_CATEGORIES_ID = {
  CHAT: 1,
  MUSIC: 2,
  SMOKING: 3,
  ANIMALS: 4,
} as const;

export const PREFERENCE_CATEGORIES_KEY = {
  CHAT: "chat",
  MUSIC: "music",
  SMOKING: "smoking",
  ANIMALS: "animals",
} as const;

export const CATEGORY_KEY_TO_ID = {
  chat: 1,
  music: 2,
  smoking: 3,
  animals: 4,
} as const;

export const CATEGORY_ID_TO_KEY = {
  1: "chat",
  2: "music",
  3: "smoking",
  4: "animals",
} as const;

export const PREFERENCE_ASSOCIATIONS: Includeable[] = [
  {
    association: "option",
    include: [{ association: "category" }],
  },
];

export const USER_DEFAULT_PREFERENCES_KEYS = ["chat_sometimes", "music_sometimes", "no_smoking", "no_animals"];
