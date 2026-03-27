import {Colorizer} from "../ports/colorizer.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

interface ConstructorParams {
    prompt: string;
    sessionId: string | undefined;
}

export class SubagentMessage implements ClaudeIOEvent {
    prompt: string;
    sessionId: string | undefined;

    constructor({prompt, sessionId}: ConstructorParams) {
        this.prompt = prompt;
        this.sessionId = sessionId;
    }

    format(colorizer: Colorizer): string {
        const label = this.sessionId
            ? `Subagent [${this.sessionId.slice(0, 8)}]`
            : "Subagent";
        return [colorizer.action(`${label}:`), this.prompt].join("\n");
    }
}
