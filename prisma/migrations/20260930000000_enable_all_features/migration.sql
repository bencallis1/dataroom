-- Internal deployment: every team gets the top plan, no paywalls
ALTER TABLE "Team" ALTER COLUMN "plan" SET DEFAULT 'datarooms-premium';

UPDATE "Team" SET "plan" = 'datarooms-premium', "pausedAt" = NULL, "pauseStartsAt" = NULL, "pauseEndsAt" = NULL;
