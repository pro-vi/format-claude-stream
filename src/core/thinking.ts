import {Colorizer} from "../colorizer-type.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class Thinking implements ClaudeIOEvent {
    constructor(private readonly thoughts: string) {}

    format(colorizer: Colorizer) {
        return colorizer.claudeThinking(`Thinking: ${this.thoughts}`);
    }
}
