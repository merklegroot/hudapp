import { spawnAndGetDataWorkflow } from "./spawnAndGetDataWorkflow";
import path from "path";
import { SpawnResult } from "../types/SpawnResult";

const scriptPath = path.join(process.cwd(), 'detect_dotnet.sh');

function execute(dataCallback?: (data: string) => void): Promise<SpawnResult> {
    return spawnAndGetDataWorkflow.execute({
        command: 'bash',
        args: [scriptPath],
        timeout: 15000,
        dataCallback
    });
}


interface DotnetDetectionResult {
    inPath: boolean;
    version?: string;
    sdks?: string[];
    runtimes?: string[];
}

/** Uses a fresh login shell to detect if dotnet is available (similar to spawnAndGetPathWorkflow) */
async function detectDotnetInFreshShell(): Promise<DotnetDetectionResult> {
    // Detect the platform and use appropriate terminal/shell
    const isWindows = process.platform === 'win32';

    let command: string;
    let args: string[];

    if (isWindows) {
        // Windows: Use cmd.exe or PowerShell
        command = 'cmd';
        args = ['/c', 'dotnet --version 2>nul && echo "---SEPARATOR---" && dotnet --list-sdks 2>nul && echo "---SEPARATOR---" && dotnet --list-runtimes 2>nul'];
    } else {
        // Unix-like systems: Use bash with login shell to get full user environment
        command = 'bash';
        args = ['-l', '-c', 'dotnet --version 2>/dev/null && echo "---SEPARATOR---" && dotnet --list-sdks 2>/dev/null && echo "---SEPARATOR---" && dotnet --list-runtimes 2>/dev/null'];
    }

    const result = await spawnAndGetDataWorkflow.execute({
        command,
        args,
        timeout: 10000
    });

    if (result.success && result.stdout.trim()) {
        // Parse the output
        const parts = result.stdout.split('---SEPARATOR---');
        const version = parts[0]?.trim();
        const sdksOutput = parts[1]?.trim();
        const runtimesOutput = parts[2]?.trim();

        const sdks = sdksOutput
            ? sdksOutput.split('\n').filter(line => line.trim()).map(line => line.trim())
            : [];

        const runtimes = runtimesOutput
            ? runtimesOutput.split('\n').filter(line => line.trim()).map(line => line.trim())
            : [];

        console.log(`Fresh shell dotnet detection succeeded - version: ${version}`);
        return {
            inPath: true,
            version,
            sdks,
            runtimes
        };
    } else {
        // dotnet not found in PATH
        console.log(`Fresh shell dotnet detection failed - code: ${result.exitCode}, stderr: ${result.stderr}`);
        return {
            inPath: false
        };
    }
}

/** Alternative method with fallback approaches */
async function detectDotnetWithFallback(): Promise<DotnetDetectionResult> {
    // Detect the platform and use appropriate terminal/shell
    const isWindows = process.platform === 'win32';

    let command: string;
    let args: string[];

    if (isWindows) {
        // Windows: Use cmd.exe or PowerShell
        command = 'cmd';
        args = ['/c', 'dotnet --version 2>nul && echo "---SEPARATOR---" && dotnet --list-sdks 2>nul && echo "---SEPARATOR---" && dotnet --list-runtimes 2>nul'];
    } else {
        // Unix-like systems: Use bash with login shell to get full user environment
        command = 'bash';
        args = ['-l', '-c', 'dotnet --version 2>/dev/null && echo "---SEPARATOR---" && dotnet --list-sdks 2>/dev/null && echo "---SEPARATOR---" && dotnet --list-runtimes 2>/dev/null'];
    }

    const result = await spawnAndGetDataWorkflow.executeWithFallback({
        command,
        args,
        timeout: 10000
    });

    if (result.success && result.stdout.trim()) {
        // Parse the output
        const parts = result.stdout.split('---SEPARATOR---');
        const version = parts[0]?.trim();
        const sdksOutput = parts[1]?.trim();
        const runtimesOutput = parts[2]?.trim();

        const sdks = sdksOutput
            ? sdksOutput.split('\n').filter(line => line.trim()).map(line => line.trim())
            : [];

        const runtimes = runtimesOutput
            ? runtimesOutput.split('\n').filter(line => line.trim()).map(line => line.trim())
            : [];

        console.log(`Fresh shell dotnet detection with fallback succeeded - version: ${version}`);
        return {
            inPath: true,
            version,
            sdks,
            runtimes
        };
    } else {
        // All methods failed or didn't find dotnet in PATH
        console.log(`All dotnet detection methods failed: ${result.stderr}`);
        return { inPath: false };
    }
}


export const dotnetDetectionWorkflow = {
    execute,
    detectDotnetInFreshShell,
    detectDotnetWithFallback
}