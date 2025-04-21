import { updateProfilePicture } from "@/controllers/user.controller.js";
import multerUploads from "@/middlewares/multerUploads.js";
import { Router } from "express";

const router = Router();

router.post("/:id/profile-picture", multerUploads, updateProfilePicture);

export default router;
