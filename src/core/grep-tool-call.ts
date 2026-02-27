import {Colorizer} from "../colorizer-type.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class GrepToolCall implements ClaudeIOEvent {
    constructor(
        private readonly pattern: string,
        private readonly path = ".",
    ) {}

    format(colorizer: Colorizer): string {
        return colorizer.action(
            `Grep: /${escape(this.pattern)}/ in ${this.path}`,
        );
    }
}

function escape(pattern: string): string {
    return pattern.replace(/[/]/g, "\\/");
}
