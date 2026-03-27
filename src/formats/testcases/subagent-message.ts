import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {SubagentMessage} from "../../core/events/subagent-message.ts";

export const data = {
    type: "user",
    message: {
        role: "user",
        content: [
            {
                type: "text",
                text: "Explore the service layer in src/lib/services/ to understand the available functions.",
            },
        ],
    },
    parent_tool_use_id: "toolu_01FwWtdDdrVVJs1uD7DXrP8E",
    session_id: "6aa8200e-516a-41a8-8586-7599003ddb56",
    uuid: "e99e390c-61c1-4bc5-86d2-a1c1a4960f6d",
    timestamp: "2026-03-27T11:53:52.343Z",
};

export const expected: ClaudeIOEvent[] = [
    new SubagentMessage({
        prompt: "Explore the service layer in src/lib/services/ to understand the available functions.",
        sessionId: "6aa8200e-516a-41a8-8586-7599003ddb56",
    }),
];

// Subagent messages fail the UserLine Zod schema because their content
// uses "text" items instead of "tool_result" items.
export const expectZodParseError = true;
