import { Router } from "express";

import { getMyInfo, requestMyDeletion, updateMyInfo, updateMyPassword, updateMyPicture } from "@/controllers";
import { imageUpload, validateAll } from "@/middlewares";
import { updateUserInfoBodySchema, updateUserPasswordBodySchema } from "@/validations";

const router = Router();

router.get("/", getMyInfo);
router.patch("/", validateAll(updateUserInfoBodySchema), updateMyInfo);
router.patch("/password", validateAll(updateUserPasswordBodySchema), updateMyPassword);
router.patch("/profile-picture", imageUpload, updateMyPicture);
router.post("/deletion-request", requestMyDeletion);

export default router;
