import { gpu } from "./gpu";

export interface gpuInfo {
    gpus: gpu[];
    openGLRenderer?: string;
}