import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {ReadToolCall} from "../../core/events/read-tool-call.ts";

export const data = {
    type: "assistant",
    message: {
        model: "claude-sonnet-4-6",
        id: "msg_017ToBJCJwzivY62Pt9vMYmv",
        type: "message",
        role: "assistant",
        content: [
            {
                type: "tool_use",
                id: "toolu_01GiLvP4m4Hadhmojgvi9koM",
                name: "Read",
                input: {file_path: "/foo/bar.ts", offset: 255, limit: 10},
                caller: {type: "direct"},
            },
        ],
        stop_reason: null,
        stop_sequence: null,
        usage: {
            input_tokens: 1,
            cache_creation_input_tokens: 390,
            cache_read_input_tokens: 38090,
            cache_creation: {
                ephemeral_5m_input_tokens: 390,
                ephemeral_1h_input_tokens: 0,
            },
            output_tokens: 1,
            service_tier: "standard",
            inference_geo: "not_available",
        },
        context_management: null,
    },
    parent_tool_use_id: null,
    session_id: "4bef8ebb-305b-446b-8e8a-dd79f3020e5e",
    uuid: "623e3464-769b-4cf3-a8ce-1b29232acbfb",
};

export const expected: ClaudeIOEvent[] = [
    new ReadToolCall("/foo/bar.ts", "toolu_01GiLvP4m4Hadhmojgvi9koM"),
];
