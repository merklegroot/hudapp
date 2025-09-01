export interface SpawnResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
}