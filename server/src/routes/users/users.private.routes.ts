import { Router } from "express";

import {
  getMyInfo,
  requestAccountDeletion,
  updateMyInfo,
  updateMyPassword,
  updateMyPicture,
} from "@/controllers";
import { imageUpload, requireAuth, validateAll } from "@/middlewares";
import { updateUserInfoSchema, updateUserPasswordSchema } from "@/validations";

const router = Router();

router.use(requireAuth);

router.get("/", getMyInfo);

router.patch("/", validateAll(updateUserInfoSchema, "body"), updateMyInfo);
router.patch("/password", validateAll(updateUserPasswordSchema, "body"), updateMyPassword);
router.patch("/profile-picture", imageUpload, updateMyPicture);

router.post("/deletion-request", requestAccountDeletion);

export default router;
