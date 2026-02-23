import { describe, it, expect } from "@jest/globals";
import { OutputFake } from "./output.fake.ts";
import { Output } from "./output.type.ts";

class ParserFormatter {
    constructor(private output: Output) { }

    async write(data: string): Promise<void> {
        const parsed = JSON.parse(data);
        if (parsed.type !== "assistant") {
            return;
        }

        this.output.write(`${parsed.message.content[0].input.description}:\n${parsed.message.content[0].name}: ${parsed.message.content[0].input.command}\n`)
    }
}

describe("an output stream parser/formatter", () => {
    it("does not write to output when merely created", () => {
        const outputFake = new OutputFake();
        new ParserFormatter(outputFake)
        expect(outputFake.value()).toBe("")
    })

    it("ignores unrecognized JSON payloads", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake)

        await pf.write("{}\n")

        expect(outputFake.value()).toBe("")
    })

    it("formats a tool call", async () => {
        const outputFake = new OutputFake();
        const pf = new ParserFormatter(outputFake)

        await pf.write(JSON.stringify({
            "type": "assistant",
            "message": {
                "type": "message",
                "content": [
                    {
                        "type": "tool_use",
                        "name": "Bash",
                        "input": {
                            "command": "pnpm test 2>&1 | tail -100",
                            "description": "Run all tests",
                            "timeout": 300000
                        }
                    }
                ],
            },
        }))

        expect(outputFake.value()).toBe("Run all tests:\nBash: pnpm test 2>&1 | tail -100\n")
    })
})