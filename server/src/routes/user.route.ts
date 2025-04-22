import multerUploads from "@/middlewares/multerUploads.js";
import validate from "@/middlewares/validate.js";
import registerSchema from "@/validators/register.validator.js";
import { Router } from "express";

import { registerUser, updateProfilePicture } from "@/controllers/user.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/:id/profile-picture", multerUploads, updateProfilePicture);

export default router;
