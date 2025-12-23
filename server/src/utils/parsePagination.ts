import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "@/constants";

import type { Request } from "express";

function parsePagination(req: Request) {
  const rawPage = Number.parseInt(req.query.page as string, 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? DEFAULT_PAGE : rawPage;

  const rawLimit = Number.parseInt(req.query.limit as string, 10);
  const limit = Math.min(
    Number.isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : rawLimit,
    MAX_LIMIT
  );

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export default parsePagination;
