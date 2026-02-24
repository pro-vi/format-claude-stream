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

        await pf.write(`{}\n`);

        expect(outputFake.value()).toBe("");
    });

    it("ignores JSON payloads with unrecognized `type`", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write(`{"type":"bork-bork-bork"}\n`);

        expect(outputFake.value()).toBe("");
    });

    it("formats a Bash tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake);

        await pf.write(
            JSON.stringify({
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
            }),
        );

        expect(outputFake.value()).toBe(dedent`
            Run all tests:
            Bash: pnpm test 2>&1 | tail -100\n
        `);
    });
});
