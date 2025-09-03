import { dotnetDetectionWorkflow } from "@/app/workflows/dotnetDetectionWorkflow";

describe('dotnetDetectionWorkflow', () => {
    test('should detect dotnet', async () => {
        const result = await dotnetDetectionWorkflow.execute();
        console.log(result);
        expect(result).toBeDefined();
    });
});