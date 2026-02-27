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
    BashToolCall,
    EditToolCall,
    GrepToolCall,
    ReadToolCall,
    ToolCall,
    UnrecognizedToolCall,
} from "./claude-stream-json-schema/tool-calls.ts";
import {UserMessageContent} from "./claude-stream-json-schema/user-message.ts";
import {Colorizer} from "./colorizer-type.ts";
import {Interpreter} from "./interpreter.ts";
import {GenericToolCall} from "./claude-io-events/generic-tool-call.ts";

export class ClaudeStreamFormatter {
    constructor(
        private output: Output,
        private colorizer: Colorizer,
    ) {}

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
        await this.writeLine(
            this.colorizer.claudeThinking(`Thinking: ${data.thinking}`),
        );
    }

    private async writeTextMessageContent(
        data: z.infer<typeof TextMessageContent>,
    ) {
        await this.writeLine(this.colorizer.claudeSpeaking(data.text));
    }

    private async writeToolResultMessageContent(
        data: z.infer<typeof UserMessageContent>,
    ) {
        await this.writeLine(data.content);
    }

    private async writeBashToolCall(toolCall: z.infer<typeof BashToolCall>) {
        await this.writeLine(
            this.colorizer.importantAction(`$ ${toolCall.input.command}`),
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
        // TODO: Interpreter is a strangler fig that will eventually replace
        // the ClaudeStreamFormatter. Replace the other occurrences of
        // this.writeLine() in this class with interpreter.process() calls as
        // below. If no appropriate event class exists, create one in
        // src/claude-io-events.
        const toolCall = UnrecognizedToolCall.parse(raw);
        const interpreter = new Interpreter(this.output, this.colorizer);
        const event = new GenericToolCall(toolCall.name, toolCall.input);
        await interpreter.process(event);
    }

    private async writeLine(text: string) {
        await this.output.write(text + "\n");
    }
}
