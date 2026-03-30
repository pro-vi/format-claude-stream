import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {ToolUseSuccess} from "../../core/events/tool-use-success.ts";

export const data = {
    type: "user",
    message: {
        role: "user",
        content: [
            {
                type: "tool_result",
                tool_use_id: "toolu_018EuV4hrybVbGuKEVBDiySH",
                content: [
                    {
                        type: "tool_reference",
                        tool_name: "TodoWrite",
                    },
                ],
            },
        ],
    },
    parent_tool_use_id: null,
    session_id: "73646c43-43e3-4766-bc65-e6c0034a68db",
    tool_use_result: {
        matches: ["TodoWrite"],
        query: "select:TodoWrite",
        total_deferred_tools: 65,
    },
};

export const expected: ClaudeIOEvent[] = [
    new ToolUseSuccess({
        toolOutput: "[tool_reference: TodoWrite]",
        toolUseId: "toolu_018EuV4hrybVbGuKEVBDiySH",
    }),
];
