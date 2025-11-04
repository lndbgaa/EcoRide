import { scheduleUserDeletionJob } from "./user.deletion.job";

export function scheduleAllJobs() {
  scheduleUserDeletionJob();
}
