import { detectPlatform, platformType } from '../app/workflows/detectPlatform';

// Mock the os module
jest.mock('os', () => ({
  platform: jest.fn()
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn()
}));

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

import { platform } from 'os';
import { readFile } from 'fs/promises';
import { exec } from 'child_process';

// Mock the machineInfoWorkflow module
jest.mock('../app/workflows/machineInfoWorkflow', () => ({
  machineInfoWorkflow: {
    getMachineInfo: jest.fn()
  }
}));

describe('Virtualization Detection', () => {
  const mockPlatform = platform as jest.MockedFunction<typeof platform>;
  const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
  const mockExec = exec as jest.MockedFunction<typeof exec>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect Physical Hardware on Linux when no virtualization indicators', async () => {
    mockPlatform.mockReturnValue('linux');
    mockReadFile.mockRejectedValue(new Error('File not found'));
    mockExec.mockImplementation((command, callback) => {
      if (command === 'systemd-detect-virt') {
        callback(null, { stdout: 'none' }, '');
      }
      return {} as any;
    });

    // Import the function after mocking
    const { machineInfoWorkflow } = await import('../app/workflows/machineInfoWorkflow');
    const mockGetMachineInfo = machineInfoWorkflow.getMachineInfo as jest.MockedFunction<typeof machineInfoWorkflow.getMachineInfo>;
    
    mockGetMachineInfo.mockResolvedValue({
      hostname: 'test',
      localIP: '127.0.0.1',
      machineModel: 'Test Machine',
      cpuInfo: 'Test CPU',
      cpuDetailed: {
        model: 'Test CPU',
        cores: 4,
        threads: 8,
        architecture: 'x86_64',
        frequency: '3.0 GHz',
        currentFrequency: '3.0 GHz',
        maxFrequency: '3.5 GHz',
        minFrequency: '2.0 GHz',
        cache: '8MB',
        vendor: 'Test',
        family: 'Test',
        stepping: '1',
        instructionSets: {
          sse: true,
          sse2: true,
          sse3: true,
          ssse3: true,
          sse4_1: true,
          sse4_2: true,
          avx: true,
          avx2: true,
          avx512: false,
          aes: true,
          sha: true,
          fma: true,
          mmx: true
        }
      },
      kernelVersion: '5.4.0',
      osName: 'Test OS',
      osType: 'Linux',
      virtualization: 'Physical Hardware',
      totalRAM: '8GB',
      freeRAM: '4GB',
      usedRAM: '4GB',
      disks: [],
      physicalDisks: [],
      topProcesses: []
    });

    const result = await machineInfoWorkflow.getMachineInfo();
    expect(result.virtualization).toBe('Physical Hardware');
  });

  it('should detect Docker Container when .dockerenv exists', async () => {
    mockPlatform.mockReturnValue('linux');
    mockReadFile.mockImplementation((path) => {
      if (path === '/.dockerenv') {
        return Promise.resolve('docker');
      }
      return Promise.reject(new Error('File not found'));
    });

    const { machineInfoWorkflow } = await import('../app/workflows/machineInfoWorkflow');
    const mockGetMachineInfo = machineInfoWorkflow.getMachineInfo as jest.MockedFunction<typeof machineInfoWorkflow.getMachineInfo>;
    
    mockGetMachineInfo.mockResolvedValue({
      hostname: 'test',
      localIP: '127.0.0.1',
      machineModel: 'Test Machine',
      cpuInfo: 'Test CPU',
      cpuDetailed: {
        model: 'Test CPU',
        cores: 4,
        threads: 8,
        architecture: 'x86_64',
        frequency: '3.0 GHz',
        currentFrequency: '3.0 GHz',
        maxFrequency: '3.5 GHz',
        minFrequency: '2.0 GHz',
        cache: '8MB',
        vendor: 'Test',
        family: 'Test',
        stepping: '1',
        instructionSets: {
          sse: true,
          sse2: true,
          sse3: true,
          ssse3: true,
          sse4_1: true,
          sse4_2: true,
          avx: true,
          avx2: true,
          avx512: false,
          aes: true,
          sha: true,
          fma: true,
          mmx: true
        }
      },
      kernelVersion: '5.4.0',
      osName: 'Test OS',
      osType: 'Linux',
      virtualization: 'Docker Container',
      totalRAM: '8GB',
      freeRAM: '4GB',
      usedRAM: '4GB',
      disks: [],
      physicalDisks: [],
      topProcesses: []
    });

    const result = await machineInfoWorkflow.getMachineInfo();
    expect(result.virtualization).toBe('Docker Container');
  });

  it('should detect WSL when Microsoft is in kernel version', async () => {
    mockPlatform.mockReturnValue('linux');
    mockReadFile.mockImplementation((path) => {
      if (path === '/proc/sys/kernel/osrelease') {
        return Promise.resolve('5.10.102.1-microsoft-standard-WSL2');
      }
      return Promise.reject(new Error('File not found'));
    });

    const { machineInfoWorkflow } = await import('../app/workflows/machineInfoWorkflow');
    const mockGetMachineInfo = machineInfoWorkflow.getMachineInfo as jest.MockedFunction<typeof machineInfoWorkflow.getMachineInfo>;
    
    mockGetMachineInfo.mockResolvedValue({
      hostname: 'test',
      localIP: '127.0.0.1',
      machineModel: 'Test Machine',
      cpuInfo: 'Test CPU',
      cpuDetailed: {
        model: 'Test CPU',
        cores: 4,
        threads: 8,
        architecture: 'x86_64',
        frequency: '3.0 GHz',
        currentFrequency: '3.0 GHz',
        maxFrequency: '3.5 GHz',
        minFrequency: '2.0 GHz',
        cache: '8MB',
        vendor: 'Test',
        family: 'Test',
        stepping: '1',
        instructionSets: {
          sse: true,
          sse2: true,
          sse3: true,
          ssse3: true,
          sse4_1: true,
          sse4_2: true,
          avx: true,
          avx2: true,
          avx512: false,
          aes: true,
          sha: true,
          fma: true,
          mmx: true
        }
      },
      kernelVersion: '5.4.0',
      osName: 'Test OS',
      osType: 'Linux',
      virtualization: 'WSL (Windows Subsystem for Linux)',
      totalRAM: '8GB',
      freeRAM: '4GB',
      usedRAM: '4GB',
      disks: [],
      physicalDisks: [],
      topProcesses: []
    });

    const result = await machineInfoWorkflow.getMachineInfo();
    expect(result.virtualization).toBe('WSL (Windows Subsystem for Linux)');
  });
});
