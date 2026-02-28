import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {ReadToolResult} from "../../core/events/read-tool-result.ts";

export const data = {
    type: "user",
    message: {
        role: "user",
        content: [
            {
                tool_use_id: "toolu_01GJNdDT37zyA8U9vSShtndC",
                type: "tool_result",
                content: "content1",
            },
        ],
    },
    parent_tool_use_id: null,
    session_id: "4bef8ebb-305b-446b-8e8a-dd79f3020e5e",
    uuid: "86f45e38-5145-44d1-9f34-ad7fb106a135",
    tool_use_result: {
        type: "text",
        file: {
            filePath:
                "/Users/ben/khan/perseus/packages/kmath/src/coefficients.ts",
            content: "content2",
            numLines: 63,
            startLine: 1,
            totalLines: 63,
        },
    },
};

export const expected: ClaudeIOEvent[] = [new ReadToolResult()];
