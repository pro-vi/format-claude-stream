import * as z from "zod";

export const UserMessageContent = z.looseObject({
    type: z.literal("tool_result"),
    content: z.string(),
    is_error: z.optional(z.boolean()),
    tool_use_id: z.string(),
});

export const UserMessage = z.looseObject({
    content: z.array(UserMessageContent),
});
