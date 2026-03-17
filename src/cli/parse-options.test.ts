import {describe, expect, it} from "vitest";
import {parseOptions, getHelpText} from "./parse-options.ts";

describe("parseOptions", () => {
    it("defaults all options given no arguments", () => {
        const options = parseOptions([]);
        expect(options).toEqual(expect.objectContaining({help: false}));
    });

    it("sets `help` when `-h` is passed", () => {
        const options = parseOptions(["-h"]);
        expect(options).toEqual(expect.objectContaining({help: true}));
    });
});

describe("getHelpText", () => {
    it("formats help text", async () => {
        const help = await getHelpText();
        expect(help).toContain(
            "Formats output from `claude --output-format stream-json` as human-readable text",
        );
        expect(help).toContain("-h, --help  Show help");
    });
});
