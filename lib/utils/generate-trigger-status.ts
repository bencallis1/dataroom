import { metadata } from "@trigger.dev/sdk/v3";

import { type TDocumentProgressStatus } from "@/lib/utils/parse-trigger-status";

/**
 * Update the status of the convert document task. Wraps the `metadata.set` method.
 */
export function updateStatus(status: TDocumentProgressStatus) {
  // `metadata.set` can be used to update the status of the task
  // as long as `updateStatus` is called within the task's `run` function.
  metadata.set("status", status);
}
