import {describe, expect, it} from "vitest";
import {GrepToolCall} from "./tool-calls.ts";

describe("the GrepToolCall schema", () => {
    it("accepts a grep tool call with no path", () => {
        const grep = {
            type: "tool_use",
            name: "Grep",
            id: "id1",
            input: {
                pattern: "a regex",
                output_mode: "content",
            },
        };

        expect(GrepToolCall.safeParse(grep)).toEqual(
            expect.objectContaining({success: true}),
        );
    });
});
