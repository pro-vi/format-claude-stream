import {describe, expect, it} from "@jest/globals";
import {GrepToolCall} from "./grep-tool-call.ts";
import {NullColorizer} from "../null-colorizer.ts";

const nullColorizer = new NullColorizer();

describe("GrepToolCall", () => {
    it("includes the path being searched in the formatted text", () => {
        const event = new GrepToolCall("a", "/foo/bar");
        expect(event.format(nullColorizer)).toBe("Grep: /a/ in /foo/bar");
    });

    it("defaults the path to '.'", () => {
        const event = new GrepToolCall("a");
        expect(event.format(nullColorizer)).toBe("Grep: /a/ in .");
    });
});
