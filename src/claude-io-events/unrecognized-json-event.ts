import {Colorizer} from "../colorizer-type.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class UnrecognizedJsonEvent implements ClaudeIOEvent {
    constructor(private readonly data: unknown) {}

    format(_: Colorizer): string {
        // TODO: add a color for errors to Colorizer, and use it here
        return "Unrecognized JSON: " + JSON.stringify(this.data);
    }
}
