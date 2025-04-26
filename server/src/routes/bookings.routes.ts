import { Router } from "express";

import { cancelBooking, createBooking } from "@/controllers/booking.controllers.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";
import { ACCOUNT_ROLES_LABEL } from "@/models/mysql/Account.model.js";
import { bookingIdParamSchema, createBookingSchema } from "@/validators/booking.validator.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.post("/", validate(createBookingSchema), createBooking);
router.patch("/:bookingId/cancel", validate(bookingIdParamSchema, "params"), cancelBooking);

export default router;
