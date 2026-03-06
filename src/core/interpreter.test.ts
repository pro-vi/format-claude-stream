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
import {ToolUseSuccess} from "./events/tool-use-success.ts";
import {ClaudeIOEvent} from "./events/claude-io-event.type.js";

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
            new ToolUseSuccess({
                toolOutput: "file contents",
                toolUseId: "id1",
            }),
        );

        expect(outputFake.value()).toBe("Read: /foo/bar\n");
    });

    it("does not output an Edit tool result", async () => {
        // The result of successful Edit tool calls is always "The file <path>
        // has been updated successfully." We don't really need to see that
        // printed to the terminal.
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new EditToolCall({path: "/foo/bar", toolUseId: "id1"}),
        );
        await interpreter.process(
            new ToolUseSuccess({
                toolOutput: "file contents",
                toolUseId: "id1",
            }),
        );

        expect(outputFake.value()).toBe("Edit: /foo/bar\n");
    });

    it("does not output an Edit tool result when there is another intervening event", async () => {
        // The result of successful Edit tool calls is always "The file <path>
        // has been updated successfully." We don't really need to see that
        // printed to the terminal.
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new EditToolCall({path: "/foo/bar", toolUseId: "id1"}),
        );
        await interpreter.process(
            new ToolUseSuccess({toolOutput: "irrelevant", toolUseId: "id2"}),
        );
        await interpreter.process(
            new ToolUseSuccess({
                toolOutput: "file contents",
                toolUseId: "id1",
            }),
        );

        expect(outputFake.value()).toBe("Edit: /foo/bar\nirrelevant\n");
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

        await interpreter.process(
            new EditToolCall({path: "/foo/bar", toolUseId: ""}),
        );

        expect(outputFake.value()).toBe("Edit: /foo/bar\n");
    });

    it("colorizes an Edit tool call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new MarkupColorizer());

        await interpreter.process(
            new EditToolCall({path: "/foo/bar", toolUseId: ""}),
        );

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

    it("outputs a blank line between a tool call output and a Bash call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new ToolUseSuccess({toolOutput: "the output", toolUseId: ""}),
        );
        await interpreter.process(new BashToolCall("echo hello"));

        expect(outputFake.value()).toBe("the output\n\n$ echo hello\n");
    });

    it("outputs a blank line between a tool call output and a Read call", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(
            new ToolUseSuccess({toolOutput: "the output", toolUseId: ""}),
        );
        await interpreter.process(
            new ReadToolCall({path: "/foo.txt", toolUseId: ""}),
        );

        expect(outputFake.value()).toBe("the output\n\nRead: /foo.txt\n");
    });

    it("does not output a blank line between file operations", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        const events: ClaudeIOEvent[] = [
            new ReadToolCall({path: "/foo.txt", toolUseId: "1"}),
            new ToolUseSuccess({toolOutput: "", toolUseId: "1"}),
            new ReadToolCall({path: "/bar.txt", toolUseId: "2"}),
            new ToolUseSuccess({toolOutput: "", toolUseId: "2"}),
            new EditToolCall({path: "/foo.txt", toolUseId: "3"}),
            new ToolUseSuccess({toolOutput: "", toolUseId: "3"}),
            new EditToolCall({path: "/bar.txt", toolUseId: "4"}),
            new ToolUseSuccess({toolOutput: "", toolUseId: "4"}),
        ];

        for (const event of events) {
            await interpreter.process(event);
        }

        expect(outputFake.value()).toBe(
            "Read: /foo.txt\nRead: /bar.txt\nEdit: /foo.txt\nEdit: /bar.txt\n",
        );
    });

    it("does not output a blank line between a tool call and its error", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        const events: ClaudeIOEvent[] = [
            new BashToolCall("echo hello"),
            new ToolUseError("You don't have permission."),
        ];

        for (const event of events) {
            await interpreter.process(event);
        }

        expect(outputFake.value()).toBe(
            "$ echo hello\nYou don't have permission.\n",
        );
    });
});
