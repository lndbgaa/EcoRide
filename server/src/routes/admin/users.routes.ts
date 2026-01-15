import { Router } from "express";

import { changeUserRole, getUsers, reactivateUser, suspendUser } from "@/controllers";
import { validateAll } from "@/middlewares";
import { getUsersQuerySchema, idParamSchema, updateUserRoleBodySchema } from "@/validations";

const router = Router();

router.get("/", validateAll(getUsersQuerySchema, "query"), getUsers);
router.patch("/:id/suspend", validateAll(idParamSchema, "params"), suspendUser);
router.patch("/:id/reactivate", validateAll(idParamSchema, "params"), reactivateUser);
router.patch("/:id/role", validateAll(idParamSchema, "params"), validateAll(updateUserRoleBodySchema), changeUserRole);

export default router;
