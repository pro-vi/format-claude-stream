import chalk from "chalk";
import {Colorizer} from "./colorizer.type.ts";

export class ChalkColorizer implements Colorizer {
    hex(code: string): (text: string) => string {
        return chalk.hex(code);
    }
}
