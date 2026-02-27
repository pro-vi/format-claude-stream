import {Colorizer} from "./colorizer-type.ts";

export class MarkupColorizer implements Colorizer {
    claudeThinking(text: string): string {
        return this.color("claudeThinking", text);
    }

    claudeSpeaking(text: string): string {
        return this.color("claudeSpeaking", text);
    }

    importantAction(text: string): string {
        return this.color("importantAction", text);
    }

    action(text: string): string {
        return this.color("action", text);
    }

    hex(code: string): (text: string) => string {
        return (text) => `[[${code} ${text}]]`;
    }

    private color(name: string, text: string) {
        return `[[${name} ${text}]]`;
    }
}
