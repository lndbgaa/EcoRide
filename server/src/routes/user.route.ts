import { Router } from "express";

import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";

import { updateProfilePicture } from "@/controllers/user.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/me/profile-picture", multerUploads, updateProfilePicture);

export default router;
