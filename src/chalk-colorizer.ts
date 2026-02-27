import chalk from "chalk";
import {Colorizer} from "./colorizer-type.ts";

export class ChalkColorizer implements Colorizer {
    claudeThinking(text: string): string {
        return this.color("#bbaa66", text);
    }

    claudeSpeaking(text: string): string {
        return this.color("#ffcc00", text);
    }

    importantAction(text: string): string {
        return this.color("#88ee88", text);
    }

    action(text: string): string {
        return this.color("#77bb77", text);
    }

    hex(code: string): (text: string) => string {
        return chalk.hex(code);
    }

    private color(code: string, text: string): string {
        return chalk.hex(code)(text);
    }
}
