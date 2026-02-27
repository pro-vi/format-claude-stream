import {Colorizer} from "../colorizer-type.ts";
import {ClaudeIOEvent} from "./claude-io-event.type.ts";

export class UnrecognizedJsonEvent implements ClaudeIOEvent {
    constructor(private readonly data: unknown) {}

    format(colorizer: Colorizer): string {
        return colorizer.error(
            "Unrecognized JSON: " + JSON.stringify(this.data),
        );
    }
}
