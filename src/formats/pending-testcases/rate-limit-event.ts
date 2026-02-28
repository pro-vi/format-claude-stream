import {ClaudeIOEvent} from "../../core/events/claude-io-event.type.js";

export const data = {
    type: "rate_limit_event",
    rate_limit_info: {
        status: "allowed",
        resetsAt: 1772323200,
        rateLimitType: "overage",
        overageStatus: "allowed",
        overageResetsAt: 1772323200,
        isUsingOverage: false,
    },
    uuid: "7b9d7608-53ca-48dd-a0ad-41f9c5a2d0a8",
    session_id: "4bef8ebb-305b-446b-8e8a-dd79f3020e5e",
};

export const expected: ClaudeIOEvent[] = [];
