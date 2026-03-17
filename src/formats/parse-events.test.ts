import {describe, expect, it} from "vitest";
import {readdirSync} from "fs";
import {join} from "path";
import {parseEvents} from "./parse-events.ts";
import {StreamJsonLine} from "./stream-json-line.ts";

const testcases = readdirSync(join(import.meta.dirname, "testcases"));

describe("parseEvents", () => {
    it.each(testcases)("passes the test for %s", async (filename) => {
        const {data, expected} = await import(
            join(import.meta.dirname, "testcases", filename)
        );

        expect(parseEvents(data)).toEqual(expected);
    });
});

describe("the Zod schema", () => {
    it.each(testcases)("returns no error when parsing %s", async (filename) => {
        const {data, expectZodParseError} = await import(
            join(import.meta.dirname, "testcases", filename)
        );

        const result = StreamJsonLine.safeParse(data);

        if (expectZodParseError) {
            expect(result.error).not.toBe(undefined);
        } else {
            expect(result.error).toBe(undefined);
        }
    });
});
