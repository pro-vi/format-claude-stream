import {ClaudeIOEvent} from "./events/claude-io-event.type.ts";
import {GenericToolResult} from "./events/generic-tool-result.ts";
import {ReadToolCall} from "./events/read-tool-call.ts";
import {Colorizer} from "./ports/colorizer.ts";
import {Output} from "./ports/output.ts";

export class Interpreter {
    private readonly readToolUseIds = new Set<string>();

    constructor(
        private readonly output: Output,
        private readonly colorizer: Colorizer,
    ) {}

    async process(event: ClaudeIOEvent): Promise<void> {
        if (this.isReadToolCall(event)) {
            this.readToolUseIds.add(event.toolUseId);
        }
        if (this.isReadResult(event)) {
            return;
        }
        return this.output.write(event.format(this.colorizer) + "\n");
    }

    private isReadToolCall(event: ClaudeIOEvent) {
        return event instanceof ReadToolCall;
    }

    private isReadResult(event: ClaudeIOEvent) {
        return (
            event instanceof GenericToolResult &&
            this.readToolUseIds.has(event.toolUseId)
        );
    }
}
