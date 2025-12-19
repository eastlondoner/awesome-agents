import { tool } from "ai";
import { getCurrentAgent } from "agents";
import type { MyAgent } from ".";
import { z } from "zod";

export const memoryInsert = tool({
  description: "Insert text at a specific location in a memory block.",
  inputSchema: z.object({
    label: z.string().describe("Which memory block to edit."),
    new_str: z.string().describe("Text to insert."),
    insert_line: z
      .number()
      .describe("Line number (0 for beginning, -1 for end)"),
  }),
  execute: async ({ label, new_str, insert_line }) => {
    const { agent } = getCurrentAgent<MyAgent>();
    if (!agent) throw new Error("Expected agent");

    if (!agent.memory.blocks.find((b) => b.label === label)) {
      return "Block not found";
    }

    const blocks = agent.memory.blocks.map((b) => {
      if (b.label === label) {
        const lines = b.value.split("\n");
        lines.splice(insert_line, 0, new_str);
        return { ...b, value: lines.join("\n"), lastUpdated: Date.now() };
      }
      return b;
    });

    agent.memory.blocks = blocks;
    return "Successfully inserted into memory block";
  },
});

export const memoryReplace = tool({
  description:
    "Replace a specific string in a memory block with a new string. Used for precise edits.",
  inputSchema: z.object({
    label: z.string().describe("Which memory block to edit"),
    old_str: z.string().describe("Exact text to find and replace"),
    new_str: z.string().describe("Replacement text"),
  }),
  execute: async ({ label, old_str, new_str }) => {
    const { agent } = getCurrentAgent<MyAgent>();
    if (!agent) throw new Error("Expected agent");

    if (!agent.memory.blocks.find((b) => b.label === label)) {
      return "Block not found";
    }

    const blocks = agent.memory.blocks.map((b) => {
      if (b.label === label) {
        return {
          ...b,
          value: b.value.replaceAll(old_str, new_str),
          lastUpdated: Date.now(),
        };
      }
      return b;
    });

    agent.memory.blocks = blocks;
    return "Successfully replaced in memory block";
  },
});

export const tools = {
  memoryInsert,
  memoryReplace,
};
