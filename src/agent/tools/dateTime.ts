import {  tool } from 'ai';
import { z } from 'zod';

export const dateTime = tool({
    description: "return the current date and time, factoring in the current timezone. Use this tool before any time-related task",
    inputSchema: z.object({}),
    execute: async () => (`The current date is ${new Date().toISOString()}`)
})