import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { BuildExtension } from "@trigger.dev/build";
import { ffmpeg } from "@trigger.dev/build/extensions/core";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { pythonExtension } from "@trigger.dev/python/extension";
import { defineConfig, timeout } from "@trigger.dev/sdk/v3";

// prismaExtension flattens the multi-file schema into prisma/ but then runs
// `prisma generate` without --schema, which only reads prisma/schema.prisma.
// A prisma.config.ts in the build root makes Prisma read the whole folder.
const prismaSchemaFolderConfig = (): BuildExtension => ({
  name: "prisma-schema-folder-config",
  onBuildComplete: async (context, manifest) => {
    if (context.target === "dev") return;
    await writeFile(
      join(manifest.outputPath, "prisma.config.ts"),
      'import { defineConfig } from "prisma/config";\n\nexport default defineConfig({ schema: "prisma" });\n',
    );
  },
});

export default defineConfig({
  project: "proj_wsqaqhnbtyfznkmhsgfz",
  dirs: ["./lib/trigger", "./ee/features/ai/lib/trigger"],
  maxDuration: timeout.None, // no max duration
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [
      prismaExtension({
        mode: "legacy",
        configFile: "./prisma.config.ts",
      }),
      prismaSchemaFolderConfig(),
      ffmpeg(),
      pythonExtension({
        scripts: ["./**/*.py"],
      }),
    ],
  },
});
