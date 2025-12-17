import { Router } from "express";

import authRouter from "./auth";
import meRouter from "./me";

import accountRouter from "./account.routes.js";
import bookingsRouter from "./bookings.routes.js";
import tripsRouter from "./trips.routes.js";
import usersRouter from "./users.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/account", accountRouter);
router.use("/me", meRouter);
router.use("/users", usersRouter);
router.use("/trips", tripsRouter);
router.use("/bookings", bookingsRouter);

export default router;
