import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";

import { approveReview, rejectReview } from "@/controllers/employee.controllers.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["employee"]));

//router.get("/reviews");
router.patch("/reviews/:id/approve", validate(idParamSchema, "params"), approveReview);
router.patch("/reviews/:id/reject", validate(idParamSchema, "params"), rejectReview);

export default router;
