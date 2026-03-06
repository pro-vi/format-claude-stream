import {Colorizer} from "../ports/colorizer.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class ReadToolCall implements ClaudeIOEvent {
    constructor(
        public readonly path: string,
        public readonly toolUseId = "",
    ) {}

    format(colorizer: Colorizer) {
        return colorizer.action(`Read: ${this.path}`);
    }
}
