import {Colorizer} from "./colorizer.type.ts";

export class NullColorizer implements Colorizer {
    hex(_: string): (text: string) => string {
        return (text) => text;
    }
}
