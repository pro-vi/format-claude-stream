import * as z from "zod";

export const EditToolCall = z.looseObject({
    name: z.literal("Edit"),
    input: z.looseObject({
        file_path: z.string(),
    }),
});

export const ReadToolCall = z.looseObject({
    name: z.literal("Read"),
    input: z.looseObject({
        file_path: z.string(),
    }),
});

export const BashToolCall = z.looseObject({
    name: z.literal("Bash"),
    input: z.looseObject({
        command: z.string(),
        description: z.string(),
        timeout: z.optional(z.number()),
    }),
});

export const GrepToolCall = z.looseObject({
    name: z.literal("Grep"),
    input: z.looseObject({
        path: z.optional(z.string()),
        pattern: z.string(),
    }),
});

export const UnrecognizedToolCall = z.looseObject({
    name: z.string(),
    input: z.any(),
});

export const ToolCall = z.discriminatedUnion("name", [
    BashToolCall,
    EditToolCall,
    GrepToolCall,
    ReadToolCall,
]);
