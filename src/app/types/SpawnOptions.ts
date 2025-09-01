export interface SpawnOptions {
    command: string;
    args: string[];
    timeout?: number;
    dataCallback?: (data: string) => void;
}