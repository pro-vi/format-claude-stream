import {Colorizer} from "../ports/colorizer.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class EditToolCall implements ClaudeIOEvent {
    constructor(
        public readonly path: string,
        public readonly toolUseId: string,
    ) {}

    format(colorizer: Colorizer): string {
        return colorizer.importantAction(`Edit: ${this.path}`);
    }
}
