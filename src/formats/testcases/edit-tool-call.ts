import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.js";
import {EditToolCall} from "../../core/events/edit-tool-call.ts";

export const data = {
    type: "assistant",
    message: {
        model: "claude-sonnet-4-6",
        id: "msg_01B8vNQZxB17dofgtbDvictH",
        type: "message",
        role: "assistant",
        content: [
            {
                type: "tool_use",
                id: "toolu_01KTyU8BkuKhTuY7HqNP8QVE",
                name: "Edit",
                input: {
                    replace_all: false,
                    file_path: "interactive-graph.tsx",
                    old_string:
                        'import {angles, geometry} from "@khanacademy/kmath";',
                    new_string:
                        'import {angles, coefficients, geometry} from "@khanacademy/kmath";',
                },
                caller: {type: "direct"},
            },
        ],
        stop_reason: null,
        stop_sequence: null,
        usage: {
            input_tokens: 1,
            cache_creation_input_tokens: 428,
            cache_read_input_tokens: 38480,
            cache_creation: {
                ephemeral_5m_input_tokens: 428,
                ephemeral_1h_input_tokens: 0,
            },
            output_tokens: 8,
            service_tier: "standard",
            inference_geo: "not_available",
        },
        context_management: null,
    },
    parent_tool_use_id: null,
    session_id: "4bef8ebb-305b-446b-8e8a-dd79f3020e5e",
    uuid: "14940cf5-11c9-4dc4-aab5-37561c419765",
};

export const expected: ClaudeIOEvent[] = [
    new EditToolCall("interactive-graph.tsx", "toolu_01KTyU8BkuKhTuY7HqNP8QVE"),
];
