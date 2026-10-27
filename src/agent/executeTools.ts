import { tools } from './tools/index.ts';

type Toolname = keyof typeof tools

export const executeTool = async (name: string, args: any) => {
    const tool = tools[name as Toolname];

    if (!tool) {
        return "This tool is not registered.";
    }

    const execute = tool.execute;

    if (!execute) {
        return "This is an invalid tool call."
    }

    const result = await execute(args, {
        toolCallId: "",
        messages: [],
        context: {}
    });

    return String(result);
}