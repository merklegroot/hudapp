import { pythonDetectionWorkflow } from '../app/workflows/pythonDetectionWorkflow';

// Mock the spawnAndGetDataWorkflow
jest.mock('../app/workflows/spawnAndGetDataWorkflow', () => ({
  spawnAndGetDataWorkflow: {
    execute: jest.fn(),
    executeWithFallback: jest.fn(),
  },
}));

import { spawnAndGetDataWorkflow } from '../app/workflows/spawnAndGetDataWorkflow';

const mockSpawnWorkflow = spawnAndGetDataWorkflow as jest.Mocked<typeof spawnAndGetDataWorkflow>;

describe('pythonDetectionWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectPythonInFreshShell', () => {
    it('should correctly parse Python 3.13 with pip and packages', async () => {
      const mockOutput = `Python 3.13.3
---SEPARATOR---
pip 24.2 from /usr/lib/python3/dist-packages/pip (python 3.13)
---SEPARATOR---
certifi==2023.11.17
charset-normalizer==3.3.2
idna==3.6
numpy==1.24.2
requests==2.31.0
urllib3==2.0.7`;

      mockSpawnWorkflow.execute.mockResolvedValue({
        success: true,
        stdout: mockOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(result.inPath).toBe(true);
      expect(result.version).toBe('Python 3.13.3');
      expect(result.pipVersion).toBe('pip 24.2 from /usr/lib/python3/dist-packages/pip (python 3.13)');
      expect(result.packages).toHaveLength(6);
      expect(result.packages).toContain('certifi==2023.11.17');
      expect(result.packages).toContain('numpy==1.24.2');
      expect(result.packages).toContain('requests==2.31.0');
    });

    it('should handle Python 2.7 installation', async () => {
      const mockOutput = `Python 2.7.18
---SEPARATOR---
pip 20.3.4 from /usr/lib/python2.7/dist-packages/pip (python 2.7)
---SEPARATOR---
setuptools==44.1.1
wheel==0.34.2`;

      mockSpawnWorkflow.execute.mockResolvedValue({
        success: true,
        stdout: mockOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(result.inPath).toBe(true);
      expect(result.version).toBe('Python 2.7.18');
      expect(result.pipVersion).toBe('pip 20.3.4 from /usr/lib/python2.7/dist-packages/pip (python 2.7)');
      expect(result.packages).toHaveLength(2);
      expect(result.packages).toContain('setuptools==44.1.1');
      expect(result.packages).toContain('wheel==0.34.2');
    });

    it('should handle Python without pip', async () => {
      const mockOutput = `Python 3.11.2
---SEPARATOR---

---SEPARATOR---
`;

      mockSpawnWorkflow.execute.mockResolvedValue({
        success: true,
        stdout: mockOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(result.inPath).toBe(true);
      expect(result.version).toBe('Python 3.11.2');
      expect(result.pipVersion).toBe('');
      expect(result.packages).toHaveLength(0);
    });

    it('should handle when Python is not in PATH', async () => {
      mockSpawnWorkflow.execute.mockResolvedValue({
        success: false,
        stdout: '',
        stderr: 'command not found: python3',
        exitCode: 127
      });

      const result = await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(result.inPath).toBe(false);
      expect(result.version).toBeUndefined();
      expect(result.pipVersion).toBeUndefined();
      expect(result.packages).toBeUndefined();
    });

    it('should limit packages to 50 items', async () => {
      // Create a mock output with many packages
      const manyPackages = Array.from({ length: 70 }, (_, i) => `package${i}==1.0.0`).join('\n');
      const mockOutput = `Python 3.10.12
---SEPARATOR---
pip 22.0.2 from /usr/lib/python3/dist-packages/pip (python 3.10)
---SEPARATOR---
${manyPackages}`;

      mockSpawnWorkflow.execute.mockResolvedValue({
        success: true,
        stdout: mockOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(result.inPath).toBe(true);
      expect(result.packages).toHaveLength(50);
      expect(result.packages![0]).toBe('package0==1.0.0');
      expect(result.packages![49]).toBe('package49==1.0.0');
    });

    it('should filter out warning messages from packages', async () => {
      const mockOutput = `Python 3.9.16
---SEPARATOR---
pip 21.2.4 from /usr/lib/python3.9/site-packages/pip (python 3.9)
---SEPARATOR---
WARNING: pip is being invoked by an old script wrapper
certifi==2021.10.8
WARNING: Some other warning message
requests==2.27.1
urllib3==1.26.8`;

      mockSpawnWorkflow.execute.mockResolvedValue({
        success: true,
        stdout: mockOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(result.inPath).toBe(true);
      expect(result.packages).toHaveLength(3);
      expect(result.packages).toContain('certifi==2021.10.8');
      expect(result.packages).toContain('requests==2.27.1');
      expect(result.packages).toContain('urllib3==1.26.8');
      // Should not contain WARNING messages
      expect(result.packages!.some(pkg => pkg.includes('WARNING'))).toBe(false);
    });

    it('should call the correct command on Unix-like systems', async () => {
      // Mock process.platform
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });

      mockSpawnWorkflow.execute.mockResolvedValue({
        success: false,
        stdout: '',
        stderr: '',
        exitCode: 127
      });

      await pythonDetectionWorkflow.detectPythonInFreshShell();

      expect(mockSpawnWorkflow.execute).toHaveBeenCalledWith({
        command: 'bash',
        args: ['-l', '-c', 'python3 --version 2>/dev/null || python --version 2>/dev/null && echo "---SEPARATOR---" && pip3 --version 2>/dev/null || pip --version 2>/dev/null && echo "---SEPARATOR---" && (pip3 list --format=freeze 2>/dev/null || pip list --format=freeze 2>/dev/null) | head -50'],
        timeout: 15000
      });

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      });
    });
  });

  describe('detectPythonWithFallback', () => {
    it('should use executeWithFallback and handle successful detection', async () => {
      const mockOutput = `Python 3.12.1
---SEPARATOR---
pip 23.3.1 from /usr/local/lib/python3.12/site-packages/pip (python 3.12)
---SEPARATOR---
Django==4.2.7
fastapi==0.104.1
uvicorn==0.24.0`;

      mockSpawnWorkflow.executeWithFallback.mockResolvedValue({
        success: true,
        stdout: mockOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await pythonDetectionWorkflow.detectPythonWithFallback();

      expect(result.inPath).toBe(true);
      expect(result.version).toBe('Python 3.12.1');
      expect(result.pipVersion).toBe('pip 23.3.1 from /usr/local/lib/python3.12/site-packages/pip (python 3.12)');
      expect(result.packages).toHaveLength(3);
      expect(result.packages).toContain('Django==4.2.7');
      expect(result.packages).toContain('fastapi==0.104.1');
      expect(result.packages).toContain('uvicorn==0.24.0');

      expect(mockSpawnWorkflow.executeWithFallback).toHaveBeenCalledWith({
        command: 'bash',
        args: ['-l', '-c', 'python3 --version 2>/dev/null || python --version 2>/dev/null && echo "---SEPARATOR---" && pip3 --version 2>/dev/null || pip --version 2>/dev/null && echo "---SEPARATOR---" && (pip3 list --format=freeze 2>/dev/null || pip list --format=freeze 2>/dev/null) | head -50'],
        timeout: 15000
      });
    });

    it('should handle failure from all fallback methods', async () => {
      mockSpawnWorkflow.executeWithFallback.mockResolvedValue({
        success: false,
        stdout: '',
        stderr: 'All spawn methods failed',
        exitCode: 127
      });

      const result = await pythonDetectionWorkflow.detectPythonWithFallback();

      expect(result.inPath).toBe(false);
      expect(result.version).toBeUndefined();
      expect(result.pipVersion).toBeUndefined();
      expect(result.packages).toBeUndefined();
    });
  });
});
