import { SUCCESS_MESSAGES } from "@/constants";
import { UserDeletionService } from "@/services";
import { catchAsync } from "@/utils";

import type { CancelUserDeletionPayload } from "@/types";
import type { Request, Response } from "express";

/**
 * Cancel a user's account deletion request.
 */
export const cancelAccountDeletion = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CancelUserDeletionPayload = req.body;

  await UserDeletionService.cancelDeletion(data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.DELETION_CANCELLED),
  });
});
