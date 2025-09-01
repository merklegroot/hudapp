export interface DotNetInfo {
    isInstalled: boolean;
    sdks: string[];
    runtimes: string[];
    inPath: boolean;
    detectedPath?: string;
    error?: string;
  }