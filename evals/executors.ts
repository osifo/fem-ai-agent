import type {
  EvalData,
  SingleTurnResult,
  MultiTurnEvalData,
  MultiTurnResult,
} from "./types.ts";

import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { buildMessages } from "./utils.ts";

const MODEL_NAME = 'openai/gpt-oss-20b';

const TOOL_DEFINITIONS: Record<string, Record<string, any>> = {
  readFile: {
    description: 'read the content of a file at a specified path',
    parameters: z.object({
      path: z.string().describe("the path to the file you want to read.")
    })
  },
  writeFile: {
    description: 'write the given content to the file at a specified path',
    parameters: z.object({
      path: z.string().describe("the path to the file you want to write to."),
      content: z.string().describe("the content to be written to file")
    })
  },
  listFiles: {
    description: 'list all the files at a specified path',
    parameters: z.object({
      path: z.string().describe("the path to the directory you want to read from")
    })
  },
  deleteFile: {
    description: 'delete the file at a specified path',
    parameters: z.object({
      path: z.string().describe("the path to the file you want to delete.")
    })
  },
  runCommand: {
    description: 'execute a shell command and return its output',
    parameters: z.object({
      path: z.string().describe("the shell command to execute.")
    })
  }
}

  export const singleTurnExecutor = async (data: EvalData) => {
    const messages = buildMessages(data);

    const tools: ToolSet = {};

    for (const toolName of data.tools) {
      const toolDefinition = TOOL_DEFINITIONS[toolName]

      if (toolDefinition) {
        tools[toolName] = tool({
          description: toolDefinition.description,
          inputSchema: toolDefinition.parameters
        })
      }
    }

    const { toolCalls } = await generateText({
      model: groq(MODEL_NAME),
      messages,
      tools,
      stopWhen: stepCountIs(1),
      telemetry: { isEnabled: true }
    });

    const calls = toolCalls.map(tc => ({
      toolName: tc.toolName,
      args: "args" in tc ? tc.args : {}
    }));

    const toolNames = toolCalls.map(tc => tc.toolName);

    return {
      toolCalls,
      toolNames,
      selectedAny: toolNames.length > 0
    }
  };
