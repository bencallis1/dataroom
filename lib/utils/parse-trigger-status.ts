import { z } from "zod";

// Kept separate from generate-trigger-status.ts so client components can
// parse run metadata without bundling @trigger.dev/sdk (which imports node:*).
const ZDocumentProgressStatus = z.object({
  progress: z.number(),
  text: z.string(),
});

export type TDocumentProgressStatus = z.infer<typeof ZDocumentProgressStatus>;

const ZDocumentProgressMetadata = z.object({
  status: ZDocumentProgressStatus,
});

/**
 * Parse the status from the metadata.
 */
export function parseStatus(data: unknown): TDocumentProgressStatus {
  return ZDocumentProgressMetadata.parse(data).status;
}
