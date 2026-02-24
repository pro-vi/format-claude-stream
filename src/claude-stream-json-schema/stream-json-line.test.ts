import {describe, it, expect} from "@jest/globals";
import {StreamJsonLine} from "./stream-json-line.ts";

describe("the StreamJsonLine schema", () => {
    it("rejects an object with an unknown `type`", () => {
        expect(StreamJsonLine.safeParse({type: "weird"})).toEqual(
            expect.objectContaining({success: false}),
        );
    });

    it("accepts a thinking message", () => {
        const thinking = {
            type: "assistant",
            message: {
                type: "message",
                content: [{type: "thinking", thinking: "Mmm... donuts"}],
            },
        };
        expect(StreamJsonLine.safeParse(thinking)).toEqual(
            expect.objectContaining({success: true}),
        );
    });

    it("accepts a tool result message", () => {
        const toolResult = {
            type: "user",
            message: {
                role: "user",
                content: [
                    {
                        type: "tool_result",
                        content: "Done!",
                        is_error: false,
                    },
                ],
            },
            tool_use_result: {
                stdout: "this is the standard output",
                stderr: "",
                interrupted: false,
                isImage: false,
                noOutputExpected: false,
            },
        };

        expect(StreamJsonLine.safeParse(toolResult)).toEqual(
            expect.objectContaining({success: true}),
        );
    });
});
