export interface gpuInfo {
    name: string;
    bus: string;
    revision: string;
    driver: string;
    index: number;
    // Optional fields for nvidia-smi when available
    memoryTotal?: string;
    memoryUsed?: string;
    memoryFree?: string;
    utilization?: number;
    temperature?: number;
}
