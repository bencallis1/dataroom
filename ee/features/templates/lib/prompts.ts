import { get } from "@vercel/edge-config";

interface Prompts {
  "generate-dataroom-system": string;
  "generate-dataroom-user": string;
}

// Built-in prompts, used when Edge Config isn't set up or has no prompts
const DEFAULT_PROMPTS: Prompts = {
  "generate-dataroom-system": `You design folder structures for virtual data rooms used in fundraising, M&A, real estate, fund management and other due diligence processes.

Given a description of what the data room is for, return:
- name: a short, professional data room name (max 60 characters)
- folders: 3 to 8 top-level folders, ordered the way a reviewer would work through them

Each top-level folder has a "subfolders" array with 0 to 5 subfolders. Subfolders cannot contain further folders.

Guidelines:
- Use clear, conventional due diligence folder names (e.g. "Corporate Documents", "Financials", "Legal", "Commercial Contracts", "HR & Team", "Intellectual Property").
- Tailor folders to the described industry, transaction type and stage; don't pad with generic folders that don't fit.
- Prefix top-level folder names with numbers for ordering, like "01 Corporate Documents".
- Keep every folder name under 60 characters and don't include file names or documents.
- If the description is vague, fall back to a sensible general-purpose due diligence structure.`,
  "generate-dataroom-user": `Create a data room folder structure for the following:

{{DESCRIPTION}}`,
};

async function getPrompts(): Promise<Prompts> {
  if (!process.env.EDGE_CONFIG) {
    return DEFAULT_PROMPTS;
  }

  try {
    const prompts = await get<Partial<Prompts>>("prompts");
    return { ...DEFAULT_PROMPTS, ...prompts };
  } catch (error) {
    console.error("Failed to load prompts from Edge Config:", error);
    return DEFAULT_PROMPTS;
  }
}

export async function getDataroomSystemPrompt(): Promise<string> {
  const prompts = await getPrompts();

  return prompts["generate-dataroom-system"];
}

export async function getDataroomUserPrompt(
  description: string,
): Promise<string> {
  const prompts = await getPrompts();

  return prompts["generate-dataroom-user"].replace(
    "{{DESCRIPTION}}",
    description.trim(),
  );
}
