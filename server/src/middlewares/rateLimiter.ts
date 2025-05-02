import { rateLimit } from "express-rate-limit";

/**
 * Limiteur global pour toutes les requêtes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    statusText: "Too Many Requests",
    message: "Trop de requêtes, veuillez réessayer plus tard.",
  },
});

/**
 * Limiteur pour les requêtes d'authentification
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    statusText: "Too Many Requests",
    message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
  },
});

/**
 * Limiteur pour les requêtes d'inscription
 */
export const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    statusText: "Too Many Requests",
    message: "Trop de tentatives d'inscription, veuillez réessayer plus tard.",
  },
});
