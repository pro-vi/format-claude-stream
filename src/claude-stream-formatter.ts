import * as z from "zod";
import {StreamJsonLine} from "./claude-stream-json-schema/stream-json-line.ts";
import {Output} from "./output.type.ts";
import type {
    AssistantLine,
    UserLine,
} from "./claude-stream-json-schema/stream-json-line.ts";
import {ToolUseMessageContent} from "./claude-stream-json-schema/assistant-message.ts";
import {
    ToolCall,
    UnrecognizedToolCall,
} from "./claude-stream-json-schema/tool-calls.ts";
import {Colorizer} from "./colorizer-type.ts";
import {Interpreter} from "./interpreter.ts";
import {GenericToolCall} from "./claude-io-events/generic-tool-call.ts";
import {GrepToolCall} from "./claude-io-events/grep-tool-call.ts";
import {EditToolCall} from "./claude-io-events/edit-tool-call.ts";
import {ReadToolCall} from "./claude-io-events/read-tool-call.ts";
import {BashToolCall} from "./claude-io-events/bash-tool-call.ts";
import {TextOutput} from "./claude-io-events/text-output.ts";
import {Thinking} from "./claude-io-events/thinking.ts";
import {GenericToolResult} from "./claude-io-events/generic-tool-result.ts";
import {ClaudeIOEvent} from "./claude-io-events/claude-io-event.type.ts";
import {UnrecognizedJsonEvent} from "./claude-io-events/unrecognized-json-event.ts";
import {UnreachableCodeError} from "./unreachable-code-error.ts";

export class ClaudeStreamFormatter {
    interpreter: Interpreter;

    constructor(output: Output, colorizer: Colorizer) {
        this.interpreter = new Interpreter(output, colorizer);
    }

    async write(data: unknown): Promise<void> {
        const events = this.parseEvents(data);
        for (const event of events) {
            await this.interpreter.process(event);
        }
    }

    private parseEvents(data: unknown): ClaudeIOEvent[] {
        const parsed = StreamJsonLine.safeParse(data);

        if (!parsed.success) {
            return [new UnrecognizedJsonEvent(data)];
        }

        switch (parsed.data.type) {
            case "assistant":
                return this.parseOutputEvents(parsed.data);
            case "result":
                // Result lines seem to just repeat text output earlier by
                // the assistant, so we ignore them.
                return [];
            case "stream_event":
                // These events provide incrementally streamed data, which is
                // also rolled up into other event types. We don't care about
                // streaming tokens to output as fast as they come in, so we
                // ignore these events.
                return [];
            case "user":
                return this.parseToolResultEvents(parsed.data);
            default:
                throw new UnreachableCodeError(parsed.data);
        }
    }

    private parseOutputEvents(
        data: z.infer<typeof AssistantLine>,
    ): ClaudeIOEvent[] {
        return data.message.content.map((content) => {
            switch (content.type) {
                case "tool_use":
                    return this.parseToolCallEvent(content);
                case "thinking":
                    return new Thinking(content.thinking);
                case "text":
                    return new TextOutput(content.text);
            }
        });
    }

    private parseToolResultEvents(
        data: z.infer<typeof UserLine>,
    ): ClaudeIOEvent[] {
        return data.message.content.map(({content}) => {
            return new GenericToolResult(content);
        });
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
                return new BashToolCall(toolCall.input.command);
            case "Read":
                return new ReadToolCall(toolCall.input.file_path);
            case "Edit":
                return new EditToolCall(toolCall.input.file_path);
            case "Grep":
                return new GrepToolCall(
                    toolCall.input.pattern,
                    toolCall.input.path,
                );
            default:
                throw new UnreachableCodeError(toolCall);
        }
    }
}
