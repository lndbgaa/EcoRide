import ms from "ms";

import type { Env } from "@/types";
import type { CookieOptions } from "express";
import type { StringValue } from "ms";

function getDefaultCookieOptions(env: Env): CookieOptions {
  return {
    httpOnly: true,
    secure: env === "production",
    sameSite: env === "production" ? "none" : "lax",
    path: "/",
  };
}

export function generateRefreshTokenCookieOptions(env: Env, refreshExpiration: StringValue): CookieOptions {
  return {
    ...getDefaultCookieOptions(env),
    maxAge: ms(refreshExpiration),
  };
}
