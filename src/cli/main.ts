#!/usr/bin/env node
import * as readline from "readline";
import {getHelpText, hideBin, parseOptions} from "./parse-options.ts";
import {ClaudeStreamFormatter} from "../claude-stream-formatter.ts";
import {StandardOutput} from "../adapters/standard-output.ts";
import {ChalkColorizer} from "../adapters/chalk-colorizer.ts";

const options = parseOptions(hideBin(process.argv));

if (options.help) {
    process.stderr.write(await getHelpText());
    process.exit(1);
}

const inputLines = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

const claudeStreamFormatter = new ClaudeStreamFormatter(
    new StandardOutput(),
    new ChalkColorizer(),
);

let promiseChain = Promise.resolve();

inputLines.on("line", (line) => {
    promiseChain = promiseChain.then(async () => {
        try {
            await claudeStreamFormatter.write(JSON.parse(line));
        } catch (e) {
            console.error(e);
            console.error("The bad line of input was:");
            console.error(line);
            process.exit(1);
        }
    });
});

inputLines.once("close", () => {});
