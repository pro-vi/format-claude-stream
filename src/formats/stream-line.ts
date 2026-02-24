import * as z from "zod";
import {AssistantMessageContent} from "./assistant-message-content.ts";

export const AssistantLine = z.object({
    type: z.literal("assistant"),
    message: z.object({
        type: z.literal("message"),
        content: z.array(AssistantMessageContent),
    }),
});

export const ResultLine = z.object({
    type: z.literal("result"),
    result: z.string(),
});

const StreamEventLine = z.object({
    type: z.literal("stream_event"),
});

const UserLine = z.object({
    type: z.literal("user"),
});

export const StreamLine = z.discriminatedUnion("type", [
    AssistantLine,
    ResultLine,
    StreamEventLine,
    UserLine,
]);
