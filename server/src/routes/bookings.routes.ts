import Router from "express";

import { cancelBooking, createBooking } from "@/controllers";
import { requireAuth, validateAll } from "@/middlewares";
import { createBookingBodySchema, idParamSchema } from "@/validations";

const router = Router();

router.use(requireAuth);

router.post("/", validateAll(createBookingBodySchema), createBooking);
router.patch("/:id/cancel", validateAll(idParamSchema, "params"), cancelBooking);

export default router;
