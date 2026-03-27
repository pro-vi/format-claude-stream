import {describe, it, expect} from "vitest";
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

    it("rejects a subagent message (text content, not tool_result)", () => {
        const subagentMessage = {
            type: "user",
            message: {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Explore the codebase.",
                    },
                ],
            },
            parent_tool_use_id: "toolu_01FwWtdDdrVVJs1uD7DXrP8E",
            session_id: "6aa8200e-516a-41a8-8586-7599003ddb56",
        };

        // The discriminated union rejects this because UserMessage expects
        // tool_result content.  parseEvents handles it via isSubagentLine
        // before reaching the union.
        expect(StreamJsonLine.safeParse(subagentMessage)).toEqual(
            expect.objectContaining({success: false}),
        );
    });

    it("accepts a subagent result (tool_result with array content)", () => {
        const subagentResult = {
            type: "user",
            message: {
                role: "user",
                content: [
                    {
                        type: "tool_result",
                        content: [{type: "text", text: "Found 12 functions."}],
                        tool_use_id: "toolu_013EEnCeXGKguWCT1qFDvtds",
                    },
                ],
            },
            tool_use_result: {
                agentType: "Explore",
                totalDurationMs: 36249,
                totalTokens: 50958,
            },
        };

        // Array content is now accepted by the UserLine schema.
        expect(StreamJsonLine.safeParse(subagentResult)).toEqual(
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
                        tool_use_id: "id1",
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
