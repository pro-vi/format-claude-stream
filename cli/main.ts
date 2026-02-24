#!/usr/bin/env -S node --import @swc-node/register/esm-register

import readline from "readline";
import {ClaudeStreamFormatter} from "../src/claude-stream-formatter.ts";
import {StandardOutput} from "../src/standard-output.ts";

const pf = new ClaudeStreamFormatter(new StandardOutput());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let promiseChain = Promise.resolve()

rl.on('line', (line) => {
    promiseChain = promiseChain.then(async () => {
        try {
            await pf.write(JSON.parse(line));
        } catch (e) {
            console.error(e)
            console.error("The bad line of input was:")
            console.error(line)
            process.exit(1)
        }
    })
});

rl.once('close', () => {

});
