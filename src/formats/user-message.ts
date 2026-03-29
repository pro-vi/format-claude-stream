import * as z from "zod";

/** Array of text content objects — shared by tool results and subagent messages. */
export const TextContentArray = z.array(
    z.looseObject({
        type: z.literal("text"),
        text: z.string(),
    }),
);

/**
 * Tool-result content can be a plain string (normal tool results) or an
 * array of text objects (subagent results returning structured content).
 */
export const ToolResultContent = z.union([z.string(), TextContentArray]);

export const UserMessageContent = z.looseObject({
    type: z.literal("tool_result"),
    content: ToolResultContent,
    is_error: z.optional(z.boolean()),
    tool_use_id: z.string(),
});

export const UserMessage = z.looseObject({
    content: z.array(UserMessageContent),
});
