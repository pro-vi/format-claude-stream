import {GenericToolResult} from "../../core/events/generic-tool-result.ts";

export const data = {
    type: "user",
    message: {
        role: "user",
        content: [
            {
                tool_use_id: "toolu_01UfhLwUgqLEzsGy1NsmDEye",
                type: "tool_result",
                content: "content1",
                is_error: false,
            },
        ],
    },
    parent_tool_use_id: null,
    session_id: "4bef8ebb-305b-446b-8e8a-dd79f3020e5e",
    uuid: "59da6c51-4617-4cdf-aed2-6e3de3fc3c09",
    tool_use_result: {
        stdout: "content2",
        stderr: "",
        interrupted: false,
        isImage: false,
        noOutputExpected: false,
    },
};

export const expected = [
    new GenericToolResult("content1", "toolu_01UfhLwUgqLEzsGy1NsmDEye"),
];
