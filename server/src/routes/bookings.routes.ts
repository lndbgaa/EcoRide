import Router from "express";

import {
  cancelBooking,
  completeBooking,
  createBooking,
  reportBookingIncident,
} from "@/controllers";
import { requireAuth, validateAll } from "@/middlewares";
import {
  createBookingBodySchema,
  idParamSchema,
  reportBookingIncidentBodySchema,
} from "@/validations";

const router = Router();

router.use(requireAuth);

router.post("/", validateAll(createBookingBodySchema), createBooking);
router.patch("/:id/cancel", validateAll(idParamSchema, "params"), cancelBooking);
router.patch("/:id/complete", validateAll(idParamSchema, "params"), completeBooking);
router.patch(
  "/:id/report-incident",
  validateAll(idParamSchema, "params"),
  validateAll(reportBookingIncidentBodySchema),
  reportBookingIncident
);

export default router;
