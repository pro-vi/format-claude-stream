import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {TaskToolCall} from "../../core/events/task-tool-call.ts";

export const data = {
    type: "assistant",
    message: {
        model: "claude-opus-4-6",
        id: "msg_019QCmPhUXrRHQCn4cUFr72U",
        type: "message",
        role: "assistant",
        content: [
            {
                type: "tool_use",
                id: "toolu_011C9YydUfQk5v4YnCdp4zUo",
                name: "Task",
                input: {
                    subagent_type: "Explore",
                    description: "Explore CLI and version context",
                    prompt: "this is the prompt",
                },
                caller: {type: "direct"},
            },
        ],
        stop_reason: null,
        stop_sequence: null,
        usage: {
            input_tokens: 1,
            cache_creation_input_tokens: 990,
            cache_read_input_tokens: 22524,
            cache_creation: {
                ephemeral_5m_input_tokens: 990,
                ephemeral_1h_input_tokens: 0,
            },
            output_tokens: 1,
            service_tier: "standard",
            inference_geo: "not_available",
        },
        context_management: null,
    },
    parent_tool_use_id: null,
    session_id: "918dfbf3-6251-4f36-b837-36d96efd3303",
    uuid: "45fcb4b7-527c-4449-b05f-51eba96f25f4",
};

export const expected: ClaudeIOEvent[] = [
    new TaskToolCall({
        toolUseId: "toolu_011C9YydUfQk5v4YnCdp4zUo",
        subagentType: "Explore",
        description: "Explore CLI and version context",
        prompt: "this is the prompt",
    }),
];
