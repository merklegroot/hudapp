import { spawnAndGetDataWorkflow } from "./spawnAndGetDataWorkflow";
import path from "path";

const scriptPath = path.join(process.cwd(), 'step_counter.sh');

function execute(dataCallback?: (data: string) => void) {
    return spawnAndGetDataWorkflow.execute({
        command: 'bash',
        args: [scriptPath],
        timeout: 15000,
        dataCallback
    });
}

export const stepCounterWorkflow = {
    execute
}