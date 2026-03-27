import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {SubagentResult} from "../../core/events/subagent-result.ts";

export const data = {
    type: "user",
    message: {
        role: "user",
        content: [
            {
                tool_use_id: "toolu_013EEnCeXGKguWCT1qFDvtds",
                type: "tool_result",
                content: [
                    {
                        type: "text",
                        text: "Service layer exploration complete. Found 12 functions across 3 modules.",
                    },
                ],
            },
        ],
    },
    parent_tool_use_id: null,
    session_id: "ebaac2ff-3407-4e21-8198-b99425691e90",
    uuid: "5f9d48e3-db98-4888-ab15-434d64756f8b",
    timestamp: "2026-03-27T12:04:50.228Z",
    tool_use_result: {
        status: "completed",
        prompt: "Explore the codebase",
        agentId: "a1f69349b20cd8980",
        agentType: "Explore",
        content: [
            {
                type: "text",
                text: "Service layer exploration complete. Found 12 functions across 3 modules.",
            },
        ],
        totalDurationMs: 36249,
        totalTokens: 50958,
        totalToolUseCount: 12,
        usage: {
            input_tokens: 7,
            output_tokens: 2443,
        },
    },
};

export const expected: ClaudeIOEvent[] = [
    new SubagentResult({
        toolUseId: "toolu_013EEnCeXGKguWCT1qFDvtds",
        output: "Service layer exploration complete. Found 12 functions across 3 modules.",
        agentType: "Explore",
        durationMs: 36249,
        totalTokens: 50958,
    }),
];
