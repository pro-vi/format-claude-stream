#!/usr/bin/env node
import * as readline from "readline";
import {ClaudeStreamFormatter} from "../claude-stream-formatter.ts";
import {StandardOutput} from "../adapters/standard-output.ts";
import {ChalkColorizer} from "../adapters/chalk-colorizer.ts";

const claudeStreamFormatter = new ClaudeStreamFormatter(
    new StandardOutput(),
    new ChalkColorizer(),
);

const inputLines = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

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
