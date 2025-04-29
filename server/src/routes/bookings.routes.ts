import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { createBookingSchema } from "@/validators/booking.validator.js";
import { idParamSchema } from "@/validators/common.validator.js";

import { cancelBooking, createBooking } from "@/controllers/bookings.controllers.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["user"]));

router.post("/", validate(createBookingSchema), createBooking);
router.patch("/:id/cancel", validate(idParamSchema, "params"), cancelBooking);

export default router;
