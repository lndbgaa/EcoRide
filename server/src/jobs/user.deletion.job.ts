import cron from "node-cron";

import { UserDeletionService } from "@/services";
import { logger } from "@/utils";

export function scheduleUserDeletionJob() {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Starting scheduled job to process expired user deletion requests...");

    try {
      const expiredUsers = await UserDeletionService.findExpiredDeletionRequests();

      for (const user of expiredUsers) {
        try {
          await UserDeletionService.deletePermanently(user.id);
          logger.info(`Processed user ${user.id}: data anonymized and related resources cleaned up`);
        } catch (err) {
          logger.error(`Error processing user ${user.id}: ${err}`);
        }
      }

      logger.info(`Scheduled user deletion job completed. ${expiredUsers.length} user(s) processed`);
    } catch (err) {
      logger.error(`Error running scheduled user deletion job: ${err}`);
    }
  });
}
