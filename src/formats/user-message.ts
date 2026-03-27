import * as z from "zod";

/**
 * Tool-result content can be a plain string (normal tool results) or an
 * array of text objects (subagent results returning structured content).
 */
const ToolResultContent = z.union([
    z.string(),
    z.array(
        z.looseObject({
            type: z.literal("text"),
            text: z.string(),
        }),
    ),
]);

export const UserMessageContent = z.looseObject({
    type: z.literal("tool_result"),
    content: ToolResultContent,
    is_error: z.optional(z.boolean()),
    tool_use_id: z.string(),
});

export const UserMessage = z.looseObject({
    content: z.array(UserMessageContent),
});
