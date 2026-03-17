import z from "zod";
import {ClaudeIOEvent} from "../core/events/claude-io-event.type.ts";
import {
    AssistantLine,
    StreamJsonLine,
    type UserLine,
} from "./stream-json-line.ts";
import {Thinking} from "../core/events/thinking.ts";
import {TextOutput} from "../core/events/text-output.ts";
import {ToolUseMessageContent} from "./assistant-message.ts";
import {ToolCall, UnrecognizedToolCall} from "./tool-calls.ts";
import {GenericToolCall} from "../core/events/generic-tool-call.ts";
import {BashToolCall} from "../core/events/bash-tool-call.ts";
import {ReadToolCall} from "../core/events/read-tool-call.ts";
import {EditToolCall} from "../core/events/edit-tool-call.ts";
import {GrepToolCall} from "../core/events/grep-tool-call.ts";
import {UnreachableCodeError} from "../lib/unreachable-code-error.ts";
import {UnrecognizedJsonEvent} from "../core/events/unrecognized-json-event.ts";
import {ToolUseSuccess} from "../core/events/tool-use-success.ts";
import {ToolUseError} from "../core/events/tool-use-error.ts";
import {TaskToolCall} from "../core/events/task-tool-call.ts";

export function parseEvents(data: unknown): ClaudeIOEvent[] {
    const parsed = StreamJsonLine.safeParse(data);

    if (!parsed.success) {
        return [new UnrecognizedJsonEvent(data)];
    }

    switch (parsed.data.type) {
        case "assistant":
            return parseOutputEvents(parsed.data);
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
        case "system":
            // E.g. the "type":"system", "subtype":"init" event. We ignore
            // these.
            return [];
        case "rate_limit_event":
            // I'm not sure what these events are for, but they get emitted
            // every time I run `claude`.
            return [];
        case "user":
            return parseToolResultEvents(parsed.data);
        default:
            throw new UnreachableCodeError(parsed.data);
    }
}

function parseOutputEvents(
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
            return new ReadToolCall({
                path: toolCall.input.file_path,
                toolUseId: toolCall.id,
            });
        case "Edit":
            return new EditToolCall({
                path: toolCall.input.file_path,
                toolUseId: toolCall.id,
            });
        case "Grep":
            return new GrepToolCall(
                toolCall.input.pattern,
                toolCall.input.path,
            );
        case "Task":
            return new TaskToolCall({
                toolUseId: toolCall.id,
                subagentType: toolCall.input.subagent_type,
                description: toolCall.input.description,
                prompt: toolCall.input.prompt,
            });
        default:
            throw new UnreachableCodeError(toolCall);
    }
}

function parseToolResultEvents(
    data: z.infer<typeof UserLine>,
): ClaudeIOEvent[] {
    return data.message.content.map(
        ({content, is_error: isError, tool_use_id: toolUseId}) => {
            if (isError) {
                return new ToolUseError(
                    content.replace(/<\/?tool_use_error>/g, ""),
                );
            }
            return new ToolUseSuccess({toolOutput: content, toolUseId});
        },
    );
}
