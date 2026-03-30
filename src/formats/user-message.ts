import * as z from "zod";

/** Array of text content objects — used by subagent input messages. */
export const TextContentArray = z.array(
    z.looseObject({
        type: z.literal("text"),
        text: z.string(),
    }),
);

/** Array of any content objects — text, tool_reference, images, etc. */
export const ContentArray = z.array(
    z.looseObject({
        type: z.string(),
    }),
);

/**
 * Tool-result content can be a plain string (normal tool results) or an
 * array of content objects (subagent results, tool references, etc.).
 */
export const ToolResultContent = z.union([z.string(), ContentArray]);

export const UserMessageContent = z.looseObject({
    type: z.literal("tool_result"),
    content: ToolResultContent,
    is_error: z.optional(z.boolean()),
    tool_use_id: z.string(),
});

export const UserMessage = z.looseObject({
    content: z.array(UserMessageContent),
});
