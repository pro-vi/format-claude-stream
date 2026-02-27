import {Colorizer} from "../colorizer.type.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class GrepToolCall implements ClaudeIOEvent {
    constructor(
        private readonly pattern: string,
        private readonly path: string,
    ) {}

    format(colorizer: Colorizer): string {
        const color = colorizer.hex("#88aa88");
        return color(
            `Searching for /${escape(this.pattern)}/ in ${this.path} ...`,
        );
    }
}

function escape(pattern: string): string {
    return pattern.replace(/[/]/g, "\\/");
}
