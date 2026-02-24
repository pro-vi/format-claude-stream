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

export const ResultLine = z.looseObject({
    type: z.literal("result"),
    result: z.string(),
});

const StreamEventLine = z.looseObject({
    type: z.literal("stream_event"),
});

/**
 * Represents input to Claude, including tool call results and file contents.
 */
export const UserLine = z.looseObject({
    type: z.literal("user"),
    message: UserMessage,
});

export const StreamLine = z.discriminatedUnion("type", [
    AssistantLine,
    ResultLine,
    StreamEventLine,
    UserLine,
]);
