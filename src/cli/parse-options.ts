import yargs from "yargs";

export {hideBin} from "yargs/helpers";

export interface CommandLineOptions {
    help: boolean;
}

const usage = `
Formats output from \`claude --output-format stream-json\` as human-readable text.

Usage: claude --print --verbose --output-format stream-json <prompt> | $0
`.trim();

const cli = yargs()
    .exitProcess(false)
    .version(false)
    .usage(usage)
    .option("help", {alias: "h", type: "boolean"});

export function parseOptions(args: string[]): CommandLineOptions {
    const yargsOptions = cli.parseSync(args, {}, () => {});

    return {help: Boolean(yargsOptions.help)};
}

export function getHelpText(): Promise<string> {
    return cli.getHelp();
}
