import {Colorizer} from "../colorizer-type.ts";

export interface ClaudeIOEvent {
    format(colorizer: Colorizer): string;
}
