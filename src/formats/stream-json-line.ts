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
    session_id: z.optional(z.string()),
});

/**
 * Subagent result lines are tool_result user messages whose
 * `tool_use_result` carries agent metadata (agentType, duration, tokens).
 */
export const SubagentResultLine = z.looseObject({
    type: z.literal("user"),
    message: UserMessage,
    tool_use_result: z.looseObject({
        agentType: z.string(),
        totalDurationMs: z.optional(z.number()),
        totalTokens: z.optional(z.number()),
    }),
});

/**
 * Runtime guard to detect subagent input lines before the discriminated
 * union parse, since they share "type":"user" but have an incompatible
 * content shape compared to tool-result user messages.
 */
export function isSubagentLine(
    data: unknown,
): data is z.infer<typeof SubagentLine> {
    return SubagentLine.safeParse(data).success;
}

/**
 * Runtime guard to detect subagent result lines.  These pass the normal
 * UserLine schema but carry agent metadata in tool_use_result that we
 * want to surface.
 */
export function isSubagentResultLine(
    data: unknown,
): data is z.infer<typeof SubagentResultLine> {
    return SubagentResultLine.safeParse(data).success;
}

export const StreamJsonLine = z.discriminatedUnion("type", [
    AssistantLine,
    UserLine,
    RateLimitEventLine,
    ResultLine,
    StreamEventLine,
    SystemLine,
]);
