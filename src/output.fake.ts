import {Output} from "./output.type.ts";

export class OutputFake implements Output {
    private written = "";

    async write(data: string): Promise<void> {
        this.written += data;
    }

    value() {
        return this.written;
    }
}
