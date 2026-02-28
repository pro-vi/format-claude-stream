import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.ts";
import {UnrecognizedJsonEvent} from "../../core/events/unrecognized-json-event.ts";

export const data = {foo: "bar"};
export const expected: ClaudeIOEvent[] = [
    new UnrecognizedJsonEvent({foo: "bar"}),
];
