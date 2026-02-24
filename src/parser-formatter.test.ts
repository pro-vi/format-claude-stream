import {describe, it, expect} from "@jest/globals";
import {OutputFake} from "./output.fake.ts";
import dedent from "dedent";
import {ParserFormatter} from "./parser-formatter.ts";

describe("an output stream parser/formatter", () => {
    it("does not write to output when merely created", () => {
        const outputFake = new OutputFake();
        new ParserFormatter(outputFake);
        expect(outputFake.value()).toBe("");
    });

    it("ignores empty JSON payloads", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({});

        expect(outputFake.value()).toBe("Unrecognized JSON: {}\n");
    });

    it("ignores JSON payloads with unrecognized `type`", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({type: "bork-bork-bork"});

        expect(outputFake.value()).toBe(
            `Unrecognized JSON: {"type":"bork-bork-bork"}\n`,
        );
    });

    it("formats a Bash tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "tool_use",
                        name: "Bash",
                        input: {
                            command: "pnpm test 2>&1 | tail -100",
                            description: "Run all tests",
                            timeout: 300000,
                        },
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe(dedent`
            Run all tests:
            Bash: pnpm test 2>&1 | tail -100\n
        `);
    });

    it("formats a Read tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "tool_use",
                        name: "Read",
                        input: {
                            file_path: "/foo/bar",
                        },
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe(dedent`
            Read: /foo/bar\n
        `);
    });

    it("formats an Edit tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "tool_use",
                        name: "Edit",
                        input: {
                            file_path: "/foo/bar",
                        },
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe(dedent`
            Edit: /foo/bar\n
        `);
    });

    it("formats thinking", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "thinking",
                        thinking: "Mmm... donuts",
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe("Thinking: Mmm... donuts\n");
    });

    it("formats a grep tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "tool_use",
                        name: "Grep",
                        input: {
                            pattern: "a regex",
                            path: "/my/project",
                            output_mode: "content",
                        },
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe("Grep: /a regex/ in /my/project\n");
    });

    it("escapes slashes in a grep pattern", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "tool_use",
                        name: "Grep",
                        input: {
                            pattern: "/",
                            path: "/my/project",
                            output_mode: "content",
                        },
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe("Grep: /\\// in /my/project\n");
    });

    it("writes an unrecognized tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "tool_use",
                        name: "UncannyValley",
                        input: {
                            foo: "bar",
                        },
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe(
            `Unrecognized tool call: UncannyValley {"foo":"bar"}\n`,
        );
    });
});
