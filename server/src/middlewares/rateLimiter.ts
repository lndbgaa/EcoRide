import { rateLimit } from "express-rate-limit";

/**
 * Limiteur global pour toutes les requêtes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requêtes par 15 minutes
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
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5, // 5 tentatives de connexion par 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    statusText: "Too Many Requests",
    message: "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.",
  },
});

/**
 * Limiteur pour les requêtes d'inscription
 */
export const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5, // 5 tentatives d'inscription par 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    statusText: "Too Many Requests",
    message: "Trop de tentatives d'inscription, veuillez réessayer plus tard.",
  },
});
