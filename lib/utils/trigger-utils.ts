import { BasePlan } from "../swr/use-billing";

export const CONVERSION_CONCURRENCY: Record<string, number> = {
  free: 1,
  starter: 1,
  pro: 2,
  business: 10,
  datarooms: 10,
  "datarooms-plus": 10,
  "datarooms-premium": 10,
};

// Returns the name of a queue defined in lib/trigger/queues.ts.
// Unknown plans (e.g. "trial") fall back to the free queue.
export const conversionQueue = (plan: string): string => {
  const planName = plan.split("+")[0] as BasePlan;
  const queuePlan = planName in CONVERSION_CONCURRENCY ? planName : "free";

  return `conversion-${queuePlan}`;
};
