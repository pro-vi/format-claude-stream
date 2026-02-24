import * as z from "zod";

export const EditToolCall = z.object({
    name: z.literal("Edit"),
    input: z.object({
        file_path: z.string(),
    }),
});

export const ReadToolCall = z.object({
    name: z.literal("Read"),
    input: z.object({
        file_path: z.string(),
    }),
});

export const BashToolCall = z.object({
    name: z.literal("Bash"),
    input: z.object({
        command: z.string(),
        description: z.string(),
        timeout: z.optional(z.number()),
    }),
});

export const GrepToolCall = z.object({
    name: z.literal("Grep"),
    input: z.object({
        path: z.optional(z.string()),
        pattern: z.string(),
    }),
});

export const UnrecognizedToolCall = z.object({
    name: z.string(),
    input: z.any(),
});

export const ToolCall = z.discriminatedUnion("name", [
    BashToolCall,
    EditToolCall,
    GrepToolCall,
    ReadToolCall,
]);
