import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class GenericToolResult implements ClaudeIOEvent {
    constructor(private readonly toolOutput: string) {}

    format() {
        return `${this.toolOutput}`;
    }
}
