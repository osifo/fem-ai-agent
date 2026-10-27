import "dotenv/config";
import { generateText, registerTelemetry, type ModelMessage } from 'ai';
import { groq } from '@ai-sdk/groq'
import { SYSTEM_PROMPT } from "./system/prompt";
import {  tools } from './tools/index'
import type { AgentCallbacks } from "../types";
import { executeTool } from "./executeTools";
import { Laminar, LaminarAiSdkTelemetry } from "@lmnr-ai/lmnr";

const MODEL_NAME = 'openai/gpt-oss-20b';

registerTelemetry(new LaminarAiSdkTelemetry());

export const runAgent = async (
    userMessage: string,
    conversationHistory?: ModelMessage[],
    callbacks?: AgentCallbacks
) => {
    const { text, toolCalls } = await generateText({
        model: groq(MODEL_NAME),
        prompt: userMessage,
        system: SYSTEM_PROMPT,
        tools,
        telemtry: {
            isEnabled: true
        }
    });

    console.log("text ====== ", text);
    console.log("toolCalls ====== ", toolCalls);

    toolCalls.forEach(async toolCall => {
        const output = await executeTool(toolCall.toolName, toolCall.input);
        console.log(output)
    })

    await Laminar.flush();
}

runAgent("hello,  what's the current time. and what date is today");