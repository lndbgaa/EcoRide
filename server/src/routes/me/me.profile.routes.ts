import { Router } from "express";

import { getMyInfo, requestMyDeletion, updateMyInfo, updateMyPassword, updateMyPicture } from "@/controllers";
import { imageUpload, requireAuth, validateAll } from "@/middlewares";
import { updateUserInfoBodySchema, updateUserPasswordBodySchema } from "@/validations";

const router = Router();

router.use(requireAuth);

router.get("/", getMyInfo);
router.patch("/", validateAll(updateUserInfoBodySchema), updateMyInfo);
router.patch("/password", validateAll(updateUserPasswordBodySchema), updateMyPassword);
router.patch("/profile-picture", imageUpload, updateMyPicture);
router.post("/deletion-request", requestMyDeletion);

export default router;
