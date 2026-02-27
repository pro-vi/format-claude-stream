import {describe, expect, it} from "@jest/globals";
import {OutputFake} from "./output.fake.ts";
import {GenericToolCall} from "./core/generic-tool-call.ts";
import {NullColorizer} from "./null-colorizer.ts";
import {Interpreter} from "./interpreter.ts";

describe("Interpreter", () => {
    it("outputs a generic tool call event", async () => {
        const outputFake = new OutputFake();
        const interpreter = new Interpreter(outputFake, new NullColorizer());

        await interpreter.process(new GenericToolCall("Hammer", {nail: 1}));

        expect(outputFake.value()).toBe(`Hammer: {"nail":1}\n`);
    });
});
