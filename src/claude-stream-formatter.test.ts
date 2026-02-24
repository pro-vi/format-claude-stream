import {describe, it, expect} from "@jest/globals";
import {OutputFake} from "./output.fake.ts";
import dedent from "dedent";
import {ClaudeStreamFormatter} from "./claude-stream-formatter.ts";
import {NullColorizer} from "./null-colorizer.ts";

const nullColorizer = new NullColorizer();

describe("ClaudeStreamFormatter", () => {
    it("does not write to output when merely created", () => {
        const outputFake = new OutputFake();
        new ClaudeStreamFormatter(outputFake, nullColorizer);
        expect(outputFake.value()).toBe("");
    });

    it("ignores empty JSON payloads", async () => {
        const outputFake = new OutputFake();
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

        await pf.write({});

        expect(outputFake.value()).toBe("Unrecognized JSON: {}\n");
    });

    it("ignores JSON payloads with unrecognized `type`", async () => {
        const outputFake = new OutputFake();
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

        await pf.write({type: "bork-bork-bork"});

        expect(outputFake.value()).toBe(
            `Unrecognized JSON: {"type":"bork-bork-bork"}\n`,
        );
    });

    it("formats a Bash tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

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

    it("writes a result payload", async () => {
        const outputFake = new OutputFake();
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

        await pf.write({
            type: "result",
            subtype: "success",
            result: "Done!",
            total_cost_usd: 0.6614302499999999,
            usage: {
                input_tokens: 21,
                cache_creation_input_tokens: 25307,
                cache_read_input_tokens: 701343,
                output_tokens: 5141,
                server_tool_use: {
                    web_search_requests: 0,
                    web_fetch_requests: 0,
                },
                service_tier: "standard",
                cache_creation: {
                    ephemeral_1h_input_tokens: 0,
                    ephemeral_5m_input_tokens: 25307,
                },
                inference_geo: "",
                iterations: [],
                speed: "standard",
            },
            modelUsage: {
                "claude-sonnet-4-6": {
                    inputTokens: 21,
                    outputTokens: 5141,
                    cacheReadInputTokens: 701343,
                    cacheCreationInputTokens: 25307,
                    webSearchRequests: 0,
                    costUSD: 0.63747025,
                    contextWindow: 200000,
                    maxOutputTokens: 32000,
                },
                "claude-haiku-4-5-20251001": {
                    inputTokens: 14945,
                    outputTokens: 1803,
                    cacheReadInputTokens: 0,
                    cacheCreationInputTokens: 0,
                    webSearchRequests: 0,
                    costUSD: 0.023960000000000002,
                    contextWindow: 200000,
                    maxOutputTokens: 32000,
                },
            },
        });

        expect(outputFake.value()).toBe("Done!\n");
    });

    it("writes a text message intended for the user", async () => {
        const outputFake = new OutputFake();
        const pf = new ClaudeStreamFormatter(outputFake, nullColorizer);

        await pf.write({
            type: "assistant",
            message: {
                type: "message",
                content: [
                    {
                        type: "text",
                        text: "Hello!",
                    },
                ],
            },
        });

        expect(outputFake.value()).toBe("Hello!\n");
    });
});
