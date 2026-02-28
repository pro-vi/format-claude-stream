import z from "zod";
import {ClaudeIOEvent} from "../core/events/claude-io-event.type.ts";
import {AssistantLine, StreamJsonLine} from "./stream-json-line.ts";
import {Thinking} from "../core/events/thinking.ts";
import {TextOutput} from "../core/events/text-output.ts";
import {ToolUseMessageContent} from "./assistant-message.ts";
import {ToolCall, UnrecognizedToolCall} from "./tool-calls.ts";
import {GenericToolCall} from "../core/events/generic-tool-call.ts";
import {BashToolCall} from "../core/events/bash-tool-call.ts";
import {ReadToolCall} from "../core/events/read-tool-call.ts";
import {EditToolCall} from "../core/events/edit-tool-call.ts";
import {GrepToolCall} from "../core/events/grep-tool-call.ts";
import {UnreachableCodeError} from "../unreachable-code-error.ts";
import {UnrecognizedJsonEvent} from "../core/events/unrecognized-json-event.ts";

export function parseEvents(raw: unknown): ClaudeIOEvent[] {
    const parsed = StreamJsonLine.safeParse(raw);

    if (!parsed.success) {
        return [new UnrecognizedJsonEvent(raw)];
    }

    const data = parsed.data;

    switch (data.type) {
        case "assistant":
            return parseOutputEvent(data);

        default:
            return [];
        // TODO: throw unreachable code error after exhausting all cases
    }
}

function parseOutputEvent(
    data: z.infer<typeof AssistantLine>,
): ClaudeIOEvent[] {
    return data.message.content.map((content) => {
        switch (content.type) {
            case "tool_use":
                return parseToolCallEvent(content);
            case "thinking":
                return new Thinking(content.thinking);
            case "text":
                return new TextOutput(content.text);
            default:
                throw new UnreachableCodeError(content);
        }
    });
}

function parseToolCallEvent(
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
