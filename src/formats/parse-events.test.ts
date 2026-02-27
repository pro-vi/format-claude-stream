import {describe, expect, it} from "@jest/globals";
import {readdirSync} from "fs";
import {join} from "path";
import {parseEvents} from "./parse-events.ts";

const testcases = readdirSync(join(import.meta.dirname, "testcases"));

describe("parseEvents", () => {
    it.each(testcases)("passes the test for %s", async (filename) => {
        const {data, expected} = await import(
            join(import.meta.dirname, "testcases", filename)
        );

        expect(parseEvents(data)).toEqual(expected);
    });
});
