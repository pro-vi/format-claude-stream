import {Colorizer} from "../ports/colorizer.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export interface ConstructorParams {
    path: string;
    toolUseId: string;
}

export class ReadToolCall implements ClaudeIOEvent {
    public readonly path: string;
    public readonly toolUseId: string;

    constructor({path, toolUseId}: ConstructorParams) {
        this.path = path;
        this.toolUseId = toolUseId;
    }

    format(colorizer: Colorizer) {
        return colorizer.action(`Read: ${this.path}`);
    }
}
