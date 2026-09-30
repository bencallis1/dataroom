import { OpenAI } from "openai";

let client: OpenAI | undefined;

// Created on first use rather than at import time: Trigger.dev imports every
// task file during deploy indexing, where OPENAI_API_KEY isn't set.
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return Reflect.get(client, prop, client);
  },
});
