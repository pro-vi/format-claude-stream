export interface Colorizer {
    hex(code: string): (text: string) => string;
}
