import {ClaudeIOEvent} from "./core/claude-io-event.type.ts";
import {Colorizer} from "./colorizer-type.ts";
import {Output} from "./output.type.ts";

export class Interpreter {
    constructor(
        private readonly output: Output,
        private readonly colorizer: Colorizer,
    ) {}

    process(event: ClaudeIOEvent): Promise<void> {
        return this.output.write(event.format(this.colorizer) + "\n");
    }
}
