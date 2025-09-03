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

export const dotnetDetectionWorkflow = {
    execute
}