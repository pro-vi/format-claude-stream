import {Colorizer} from "../ports/colorizer.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

interface ConstructorParams {
    toolUseId: string;
    subagentType: string;
    description: string;
    prompt: string;
}

export class TaskToolCall implements ClaudeIOEvent {
    toolUseId: string;
    subagentType: string;
    description: string;
    prompt: string;

    constructor({
        toolUseId,
        subagentType,
        description,
        prompt,
    }: ConstructorParams) {
        this.toolUseId = toolUseId;
        this.subagentType = subagentType;
        this.description = description;
        this.prompt = prompt;
    }

    format(colorizer: Colorizer): string {
        let headline = `Task (${this.subagentType}): ${this.description}`;
        return [colorizer.importantAction(headline), this.prompt].join("\n");
    }
}
