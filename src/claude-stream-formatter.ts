import * as z from "zod";
import {StreamJsonLine} from "./claude-stream-json-schema/stream-json-line.ts";
import {Output} from "./output.type.ts";
import type {
    AssistantLine,
    UserLine,
} from "./claude-stream-json-schema/stream-json-line.ts";
import {
    TextMessageContent,
    ThinkingMessageContent,
    ToolUseMessageContent,
} from "./claude-stream-json-schema/assistant-message.ts";
import {
    ToolCall,
    UnrecognizedToolCall,
} from "./claude-stream-json-schema/tool-calls.ts";
import {UserMessageContent} from "./claude-stream-json-schema/user-message.ts";
import {Colorizer} from "./colorizer-type.ts";
import {Interpreter} from "./interpreter.ts";
import {GenericToolCall} from "./claude-io-events/generic-tool-call.ts";
import {GrepToolCall as GrepToolCallEvent} from "./claude-io-events/grep-tool-call.ts";
import {EditToolCall as EditToolCallEvent} from "./claude-io-events/edit-tool-call.ts";
import {ReadToolCall as ReadToolCallEvent} from "./claude-io-events/read-tool-call.ts";
import {BashToolCall as BashToolCallEvent} from "./claude-io-events/bash-tool-call.ts";
import {TextOutput} from "./claude-io-events/text-output.ts";
import {Thinking} from "./claude-io-events/thinking.ts";
import {GenericToolResult} from "./claude-io-events/generic-tool-result.ts";
import {ClaudeIOEvent} from "./claude-io-events/claude-io-event.type.ts";

export class ClaudeStreamFormatter {
    interpreter: Interpreter;

    constructor(
        private output: Output,
        colorizer: Colorizer,
    ) {
        this.interpreter = new Interpreter(output, colorizer);
    }

    async write(data: unknown): Promise<void> {
        const parsed = StreamJsonLine.safeParse(data);

        if (!parsed.success) {
            await this.writeLine(`Unrecognized JSON: ${JSON.stringify(data)}`);
            return;
        }

        switch (parsed.data.type) {
            case "assistant":
                await this.writeAssistantLine(parsed.data);
                break;
            case "result":
                // Result lines seem to just repeat text output earlier by
                // the assistant, so we ignore them.
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
        const event = this.parseToolCallEvent(data);
        await this.interpreter.process(event);
    }

    private parseToolCallEvent(
        data: z.infer<typeof ToolUseMessageContent>,
    ): ClaudeIOEvent {
        const parsedToolCall = ToolCall.safeParse(data);

        if (!parsedToolCall.success) {
            const toolCall = UnrecognizedToolCall.parse(data);
            return new GenericToolCall(toolCall.name, toolCall.input);
        }

        const toolCall = parsedToolCall.data;

        switch (toolCall.name) {
            case "Bash":
                return new BashToolCallEvent(toolCall.input.command);
            case "Read":
                return new ReadToolCallEvent(toolCall.input.file_path);
            case "Edit":
                return new EditToolCallEvent(toolCall.input.file_path);
            case "Grep":
                return new GrepToolCallEvent(
                    toolCall.input.pattern,
                    toolCall.input.path,
                );
            default:
                toolCall satisfies never;
                throw new Error(
                    "parseToolCallEvent: unhandled tool: " +
                        (toolCall as any).name,
                );
        }
    }

    private async writeThinkingMessageContent(
        data: z.infer<typeof ThinkingMessageContent>,
    ) {
        const event = new Thinking(data.thinking);
        await this.interpreter.process(event);
    }

    private async writeTextMessageContent(
        data: z.infer<typeof TextMessageContent>,
    ) {
        const event = new TextOutput(data.text);
        await this.interpreter.process(event);
    }

    private async writeToolResultMessageContent(
        data: z.infer<typeof UserMessageContent>,
    ) {
        const event = new GenericToolResult(data.content);
        await this.interpreter.process(event);
    }

    private async writeLine(text: string) {
        await this.output.write(text + "\n");
    }
}
