import * as z from "zod";
import {AssistantMessageContent} from "./assistant-message-content.ts";
import {UserMessage} from "./user-message.ts";

export const AssistantLine = z.looseObject({
    type: z.literal("assistant"),
    message: z.looseObject({
        type: z.literal("message"),
        content: z.array(AssistantMessageContent),
    }),
});

export const ResultLine = z.looseObject({
    type: z.literal("result"),
    result: z.string(),
});

const StreamEventLine = z.looseObject({
    type: z.literal("stream_event"),
});

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
