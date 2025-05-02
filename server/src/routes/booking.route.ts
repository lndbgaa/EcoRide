import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import {
  confirmBookingWithIncidentSchema,
  createBookingSchema,
} from "@/validators/booking.validator.js";
import { idParamSchema } from "@/validators/common.validator.js";

import {
  cancelBooking,
  createBooking,
  reportIncidentAndValidateBooking,
  validateBooking,
} from "@/controllers/booking.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(createBookingSchema),
  createBooking
);

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(idParamSchema, "params"),
  cancelBooking
);

router.patch(
  "/:id/validate-success",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(idParamSchema, "params"),
  validateBooking
);

router.patch(
  "/:id/validate-incident",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(idParamSchema, "params"),
  validate(confirmBookingWithIncidentSchema),
  reportIncidentAndValidateBooking
);

export default router;
