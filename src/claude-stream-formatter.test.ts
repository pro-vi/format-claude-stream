import {describe, it, expect} from "@jest/globals";
import {OutputFake} from "./core/ports/output-fake.ts";
import {ClaudeStreamFormatter} from "./claude-stream-formatter.ts";
import {NullColorizer} from "./core/ports/null-colorizer.ts";

const nullColorizer = new NullColorizer();

describe("ClaudeStreamFormatter", () => {
    it("does not write to output when merely created", () => {
        const outputFake = new OutputFake();
        new ClaudeStreamFormatter(outputFake, nullColorizer);
        expect(outputFake.value()).toBe("");
    });

    it("prints empty JSON payloads", async () => {
        const outputFake = new OutputFake();
        const csf = new ClaudeStreamFormatter(outputFake, nullColorizer);

        await csf.write({});

        expect(outputFake.value()).toBe("Unrecognized JSON: {}\n");
    });

    it("prints JSON payloads with unrecognized `type`", async () => {
        const outputFake = new OutputFake();
        const csf = new ClaudeStreamFormatter(outputFake, nullColorizer);

        await csf.write({type: "bork-bork-bork"});

        expect(outputFake.value()).toBe(
            `Unrecognized JSON: {"type":"bork-bork-bork"}\n`,
        );
    });
});
