import { queue } from "@trigger.dev/sdk";

import { CONVERSION_CONCURRENCY } from "@/lib/utils/trigger-utils";

// Trigger.dev v4 requires queues to be defined ahead of time; tasks are
// routed to these by name via `conversionQueue(plan)` at trigger time.
export const conversionQueues = Object.entries(CONVERSION_CONCURRENCY).map(
  ([plan, concurrencyLimit]) =>
    queue({ name: `conversion-${plan}`, concurrencyLimit }),
);
