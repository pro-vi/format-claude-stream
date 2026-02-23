export interface Output {
    write(data: string): Promise<void>;
}
