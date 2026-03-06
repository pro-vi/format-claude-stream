import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class GenericToolResult implements ClaudeIOEvent {
    constructor(
        public readonly toolOutput: string,
        public readonly toolUseId: string,
    ) {}

    format() {
        return `${this.toolOutput}`;
    }
}
