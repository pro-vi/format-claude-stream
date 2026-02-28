import * as z from "zod";
import {AssistantMessage} from "./assistant-message.ts";
import {UserMessage} from "./user-message.ts";

/**
 * Represents output from Claude, including tool calls, thinking, and
 * user-facing text.
 */
export const AssistantLine = z.looseObject({
    type: z.literal("assistant"),
    message: AssistantMessage,
});

const ToolUseResult = z.looseObject({
    // TODO: narrow this type down once I understand it better
    type: z.optional(z.string()),
});

/**
 * Represents input to Claude, including tool call results and file contents.
 */
export const UserLine = z.looseObject({
    type: z.literal("user"),
    message: UserMessage,
    tool_use_result: z.optional(ToolUseResult),
});

export const ResultLine = z.looseObject({
    type: z.literal("result"),
    result: z.string(),
});

const StreamEventLine = z.looseObject({
    type: z.literal("stream_event"),
});

const SystemLine = z.looseObject({
    type: z.literal("system"),
});

const RateLimitEventLine = z.looseObject({
    type: z.literal("rate_limit_event"),
});

export const StreamJsonLine = z.discriminatedUnion("type", [
    AssistantLine,
    UserLine,
    RateLimitEventLine,
    ResultLine,
    StreamEventLine,
    SystemLine,
]);
