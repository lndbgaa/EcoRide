import { Router } from "express";

import { imageUpload, requireAuth, validateAll } from "@/middlewares";
import { updateUserInfoSchema, updateUserPasswordSchema } from "@/validation";

import { getMyInfo, updateMyInfo, updateMyPassword, updateMyPicture } from "@/controllers";

const router = Router();

router.use(requireAuth);

router.get("/", getMyInfo);
router.patch("/", validateAll(updateUserInfoSchema), updateMyInfo);
router.patch("/password", validateAll(updateUserPasswordSchema), updateMyPassword);
router.patch("/profile-picture", imageUpload, updateMyPicture);

export default router;
