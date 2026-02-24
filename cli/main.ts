#!/usr/bin/env -S node --import @swc-node/register/esm-register

import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
    console.log(line);
});

rl.once('close', () => {

});
