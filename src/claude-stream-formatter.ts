import * as z from "zod";
import {StreamLine} from "./formats/stream-line.ts";
import {Output} from "./output.type.ts";
import type {
    AssistantLine,
    ResultLine,
    UserLine,
} from "./formats/stream-line.ts";
import {
    TextMessageContent,
    ThinkingMessageContent,
    ToolUseMessageContent,
} from "./formats/assistant-message-content.ts";
import {
    BashToolCall,
    EditToolCall,
    GrepToolCall,
    ReadToolCall,
    ToolCall,
    UnrecognizedToolCall,
} from "./formats/tool-calls.ts";
import {UserMessageContent} from "./formats/user-message.ts";

export class ClaudeStreamFormatter {
    constructor(private output: Output) {}

    async write(data: unknown): Promise<void> {
        const parsed = StreamLine.safeParse(data);

        if (!parsed.success) {
            await this.writeLine(`Unrecognized JSON: ${JSON.stringify(data)}`);
            return;
        }

        switch (parsed.data.type) {
            case "assistant":
                await this.writeAssistantLine(parsed.data);
                break;
            case "result":
                await this.writeResultLine(parsed.data);
                break;
            case "stream_event":
                // These events provide incrementally streamed data, which is
                // also rolled up into other event types. We don't care about
                // streaming tokens to output as fast as they come in, so we
                // ignore these events.
                break;
            case "user":
                await this.writeUserLine(parsed.data);
                break;
            default:
                await this.writeLine(JSON.stringify(parsed.data));
                break;
        }
    }

    private async writeAssistantLine(data: z.infer<typeof AssistantLine>) {
        for (const content of data.message.content) {
            switch (content.type) {
                case "tool_use":
                    await this.writeToolUseMessageContent(content);
                    break;
                case "thinking":
                    await this.writeThinkingMessageContent(content);
                    break;
                case "text":
                    await this.writeTextMessageContent(content);
                    break;
            }
        }
    }

    private async writeResultLine(data: z.infer<typeof ResultLine>) {
        this.writeLine(data.result);
    }

    private async writeUserLine(data: z.infer<typeof UserLine>) {
        for (const content of data.message.content) {
            switch (content.type) {
                case "tool_result":
                    await this.writeToolResultMessageContent(content);
                    break;
            }
        }
    }

    private async writeToolUseMessageContent(
        data: z.infer<typeof ToolUseMessageContent>,
    ) {
        const parsedToolCall = ToolCall.safeParse(data);

        if (!parsedToolCall.success) {
            await this.writeUnrecognizedToolCall(data);
            return;
        }

        const toolCall = parsedToolCall.data;

        switch (toolCall.name) {
            case "Bash":
                await this.writeBashToolCall(toolCall);
                break;
            case "Read":
                await this.writeReadToolCall(toolCall);
                break;
            case "Edit":
                await this.writeEditToolCall(toolCall);
                break;
            case "Grep":
                await this.writeGrepToolCall(toolCall);
                break;
            default:
                await this.writeUnrecognizedToolCall(toolCall);
        }
    }

    private async writeThinkingMessageContent(
        data: z.infer<typeof ThinkingMessageContent>,
    ) {
        await this.writeLine(`Thinking: ${data.thinking}`);
    }

    private async writeTextMessageContent(
        data: z.infer<typeof TextMessageContent>,
    ) {
        await this.writeLine(data.text);
    }

    private async writeToolResultMessageContent(
        data: z.infer<typeof UserMessageContent>,
    ) {
        await this.writeLine(data.content);
    }

    private async writeBashToolCall(toolCall: z.infer<typeof BashToolCall>) {
        await this.writeLine(
            `${toolCall.input.description}:\n${toolCall.name}: ${toolCall.input.command}`,
        );
    }

    private async writeReadToolCall(toolCall: z.infer<typeof ReadToolCall>) {
        await this.writeLine(`Read: ${toolCall.input.file_path}`);
    }

    private async writeEditToolCall(toolCall: z.infer<typeof EditToolCall>) {
        await this.writeLine(`Edit: ${toolCall.input.file_path}`);
    }

    private async writeGrepToolCall(toolCall: z.infer<typeof GrepToolCall>) {
        const escapedPattern = toolCall.input.pattern.replace(/[/]/g, "\\/");
        await this.writeLine(
            `Grep: /${escapedPattern}/ in ${toolCall.input.path}`,
        );
    }

    private async writeUnrecognizedToolCall(raw: unknown) {
        const toolCall = UnrecognizedToolCall.parse(raw);

        await this.writeLine(
            `Unrecognized tool call: ${toolCall.name} ${JSON.stringify(toolCall.input)}`,
        );
    }

    private async writeLine(text: string) {
        await this.output.write(text + "\n");
    }
}
