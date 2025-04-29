import type { Request } from "express";

const parsePagination = (req: Request) => {
  // Parse la page (1 par défaut)
  const rawPage = parseInt(req.query.page as string, 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Parse le nombre d'éléments par page (10 par défaut)
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 10 : rawLimit;

  // Calcule le nombre d'éléments à ignorer
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export default parsePagination;
