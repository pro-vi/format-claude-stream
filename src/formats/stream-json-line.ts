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

const ToolUseResult = z.union([
    z.string(),
    z.looseObject({
        // TODO: narrow this type down once I understand it better
        type: z.optional(z.string()),
    }),
]);

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

/**
 * Subagent input messages share "type":"user" but carry text content (the
 * subagent prompt) instead of tool_result content.  They also always have
 * a `parent_tool_use_id` field linking them to the Agent/Task tool call
 * that spawned the subagent.
 */
export const SubagentLine = z.looseObject({
    type: z.literal("user"),
    message: z.looseObject({
        role: z.literal("user"),
        content: z.array(
            z.looseObject({
                type: z.literal("text"),
                text: z.string(),
            }),
        ),
    }),
    parent_tool_use_id: z.string(),
    session_id: z.optional(z.string()),
});

/**
 * Runtime guard to detect subagent lines before the discriminated union
 * parse, since they share "type":"user" but have an incompatible content
 * shape compared to tool-result user messages.
 */
export function isSubagentLine(
    data: unknown,
): data is z.infer<typeof SubagentLine> {
    return SubagentLine.safeParse(data).success;
}

export const StreamJsonLine = z.discriminatedUnion("type", [
    AssistantLine,
    UserLine,
    RateLimitEventLine,
    ResultLine,
    StreamEventLine,
    SystemLine,
]);
