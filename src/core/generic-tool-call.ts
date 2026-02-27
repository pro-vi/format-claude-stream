import {Colorizer} from "../colorizer-type.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class GenericToolCall implements ClaudeIOEvent {
    constructor(
        private readonly toolName: string,
        private readonly params: unknown,
    ) {}

    format(colorizer: Colorizer) {
        return colorizer.action(
            `${this.toolName}: ${JSON.stringify(this.params)}`,
        );
    }
}
