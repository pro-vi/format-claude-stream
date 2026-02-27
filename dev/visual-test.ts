#!/usr/bin/env -S node --import @swc-node/register/esm-register

import { ChalkColorizer } from "../src/chalk-colorizer";

function main() {
    const colors = new ChalkColorizer();
    console.log(colors.error("This is what an error message looks like"));
    console.log(colors.claudeSpeaking("Hello, world!"));
    console.log(colors.claudeThinking("These are the thoughts of Claude."));
    console.log(colors.importantAction("I'm doing something dangerous."));
    console.log(colors.action("This is probably safe."));
}

main();