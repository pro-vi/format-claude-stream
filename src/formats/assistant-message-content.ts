import * as z from "zod";

export const ThinkingMessageContent = z.object({
    type: z.literal("thinking"),
    thinking: z.string(),
});

export const TextMessageContent = z.object({
    type: z.literal("text"),
    text: z.string(),
});

export const ToolUseMessageContent = z.object({
    type: z.literal("tool_use"),
    name: z.string(),
    input: z.any(),
});

export const AssistantMessageContent = z.discriminatedUnion("type", [
    ThinkingMessageContent,
    TextMessageContent,
    ToolUseMessageContent,
]);
