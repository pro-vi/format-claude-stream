import {Colorizer} from "./colorizer-type.ts";

export class NullColorizer implements Colorizer {
    claudeThinking(text: string): string {
        return text;
    }

    claudeSpeaking(text: string): string {
        return text;
    }

    importantAction(text: string): string {
        return text;
    }

    action(text: string): string {
        return text;
    }

    hex(_: string): (text: string) => string {
        return (text) => text;
    }
}
