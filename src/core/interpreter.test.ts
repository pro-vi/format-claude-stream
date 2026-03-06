import {describe, expect, it} from "@jest/globals";
import {OutputFake} from "./ports/output-fake.ts";
import {BashToolCall} from "./events/bash-tool-call.ts";
import {EditToolCall} from "./events/edit-tool-call.ts";
import {GenericToolCall} from "./events/generic-tool-call.ts";
import {GrepToolCall} from "./events/grep-tool-call.ts";
import {ReadToolCall} from "./events/read-tool-call.ts";
import {TextOutput} from "./events/text-output.ts";
import {Thinking} from "./events/thinking.ts";
import {ToolUseError} from "./events/tool-use-error.ts";
import {NullColorizer} from "./ports/null-colorizer.ts";
import {MarkupColorizer} from "./ports/markup-colorizer.ts";
import {Interpreter} from "./interpreter.ts";
import {GenericToolResult} from "./events/generic-tool-result.ts";

describe("Interpreter", () => {
    it("outputs a generic tool call event", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new GenericToolCall("Hammer", {nail: 1}));

        expect(outputFake.value()).toBe(`Hammer: {"nail":1}\n`);
    });

    it("formats a Bash tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new BashToolCall("pnpm test 2>&1 | tail -100"),
        );

        expect(outputFake.value()).toBe("$ pnpm test 2>&1 | tail -100\n");
    });

    it("colorizes a Bash tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(
            new BashToolCall("pnpm test 2>&1 | tail -100"),
        );

        expect(outputFake.value()).toBe(
            "[[importantAction $ pnpm test 2>&1 | tail -100]]\n",
        );
    });

    it("formats a Read tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new ReadToolCall({path: "/foo/bar", toolUseId: ""}),
        );

        expect(outputFake.value()).toBe("Read: /foo/bar\n");
    });

    it("does not output a Read tool result", async () => {
        // The result of Read tool calls is just the file contents. We don't
        // really need to see that printed to the terminal.
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new ReadToolCall({path: "/foo/bar", toolUseId: "id1"}),
        );
        await interpreter.process(
            new GenericToolResult({
                toolOutput: "file contents",
                toolUseId: "id1",
            }),
        );

        expect(outputFake.value()).toBe("Read: /foo/bar\n");
    });

    it("colorizes a Read tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(
            new ReadToolCall({path: "/foo/bar", toolUseId: ""}),
        );

        expect(outputFake.value()).toBe("[[action Read: /foo/bar]]\n");
    });

    it("formats an Edit tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new EditToolCall("/foo/bar"));

        expect(outputFake.value()).toBe("Edit: /foo/bar\n");
    });

    it("colorizes an Edit tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(new EditToolCall("/foo/bar"));

        expect(outputFake.value()).toBe("[[importantAction Edit: /foo/bar]]\n");
    });

    it("formats thinking", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new Thinking("Mmm... donuts"));

        expect(outputFake.value()).toBe("Thinking: Mmm... donuts\n");
    });

    it("colorizes thinking", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(new Thinking("Mmm... donuts"));

        expect(outputFake.value()).toBe(
            "[[claudeThinking Thinking: Mmm... donuts]]\n",
        );
    });

    it("formats a grep tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new GrepToolCall("a regex", "/my/project"));

        expect(outputFake.value()).toBe("Grep: /a regex/ in /my/project\n");
    });

    it("colorizes a grep tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(new GrepToolCall("a regex", "/my/project"));

        expect(outputFake.value()).toBe(
            "[[action Grep: /a regex/ in /my/project]]\n",
        );
    });

    it("escapes slashes in a grep pattern", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new GrepToolCall("/", "/my/project"));

        expect(outputFake.value()).toBe("Grep: /\\// in /my/project\n");
    });

    it("writes an unrecognized tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new GenericToolCall("UncannyValley", {foo: "bar"}),
        );

        expect(outputFake.value()).toBe(`UncannyValley: {"foo":"bar"}\n`);
    });

    it("writes a text message intended for the user", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new TextOutput("Hello!"));

        expect(outputFake.value()).toBe("Hello!\n");
    });

    it("colorizes text messages", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(new TextOutput("Hello!"));

        expect(outputFake.value()).toBe("[[claudeSpeaking Hello!]]\n");
    });

    it("formats a tool use error", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(new ToolUseError("Kablooie"));

        expect(outputFake.value()).toBe(`[[error Kablooie]]\n`);
    });
});
