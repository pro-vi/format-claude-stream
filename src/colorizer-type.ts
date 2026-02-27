export interface Colorizer {
    hex(code: string): (text: string) => string;

    claudeThinking(text: string): string;

    claudeSpeaking(text: string): string;

    importantAction(text: string): string;

    action(text: string): string;
}
