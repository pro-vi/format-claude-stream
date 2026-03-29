import {Colorizer} from "../ports/colorizer.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

const RESULT_PREVIEW_MAX_LENGTH = 200;

interface ConstructorParams {
    toolUseId: string;
    output: string;
    agentType: string | undefined;
    durationMs: number | undefined;
    totalTokens: number | undefined;
}

export class SubagentResult implements ClaudeIOEvent {
    toolUseId: string;
    output: string;
    agentType: string | undefined;
    durationMs: number | undefined;
    totalTokens: number | undefined;

    constructor({
        toolUseId,
        output,
        agentType,
        durationMs,
        totalTokens,
    }: ConstructorParams) {
        this.toolUseId = toolUseId;
        this.output = output;
        this.agentType = agentType;
        this.durationMs = durationMs;
        this.totalTokens = totalTokens;
    }

    format(colorizer: Colorizer): string {
        const parts: string[] = [];
        if (this.agentType) parts.push(this.agentType);
        if (this.durationMs != null) {
            const secs = (this.durationMs / 1000).toFixed(1);
            parts.push(`${secs}s`);
        }
        if (this.totalTokens != null) {
            parts.push(`${this.totalTokens} tok`);
        }
        const meta = parts.length > 0 ? ` (${parts.join(", ")})` : "";

        const preview =
            this.output.length > RESULT_PREVIEW_MAX_LENGTH
                ? this.output.slice(0, RESULT_PREVIEW_MAX_LENGTH) + "…"
                : this.output;
        return [colorizer.action(`Subagent result${meta}:`), preview].join(
            "\n",
        );
    }
}
