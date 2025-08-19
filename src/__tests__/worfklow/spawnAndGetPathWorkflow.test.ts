import { spawnAndGetPathWorkflow } from "@/app/workflows/spawnAndGetPathWorkflow";

describe('spawnAndGetPathWorkflow', () => {
    test('should spawn and get the path', async () => {
        const path = await spawnAndGetPathWorkflow.execute();
        console.log(path);
        expect(path).toBeDefined();
    });
});