import fs from 'fs';
import path from 'path';
import { spawnAndGetPathWorkflow } from './spawnAndGetPathWorkflow';

interface PathInfo {
  path: string;
  exists: boolean;
  isDirectory: boolean;
  readable: boolean;
  executableCount?: number;
}

interface PathData {
  pathVariable: string;
  totalPaths: number;
  paths: PathInfo[];
  shell: string;
  user: string;
  workingDirectory: string;
  existingPaths: number;
  readablePaths: number;
  debug: {
    serverPath: string;
  };
}


async function getPathInfo(): Promise<PathData> {
  let pathEnv = '';
  
  pathEnv = await spawnAndGetPathWorkflow.executeWithFallback();
  if (!pathEnv)
    throw new Error('PATH environment variable not found');

  // Split the PATH into individual directories
  const pathDirs = pathEnv.split(':').filter(dir => dir.trim() !== '');
  
  // Check each path directory for existence and properties
  const pathInfo: PathInfo[] = await Promise.all(
    pathDirs.map(async (dir) => {
      const info: PathInfo = {
        path: dir,
        exists: false,
        isDirectory: false,
        readable: false,
      };

      try {
        const stats = await fs.promises.stat(dir);
        info.exists = true;
        info.isDirectory = stats.isDirectory();
        
        // Check if readable
        try {
          await fs.promises.access(dir, fs.constants.R_OK);
          info.readable = true;
          
          // If it's a readable directory, count executable files
          if (info.isDirectory && info.readable) {
            try {
              const files = await fs.promises.readdir(dir);
              let executableCount = 0;
              
              await Promise.all(files.map(async (file) => {
                try {
                  const filePath = path.join(dir, file);
                  const fileStats = await fs.promises.stat(filePath);
                  if (fileStats.isFile()) {
                    await fs.promises.access(filePath, fs.constants.X_OK);
                    executableCount++;
                  }
                } catch {
                  // File not executable or other error, skip
                }
              }));
              
              info.executableCount = executableCount;
            } catch {
              // Can't read directory contents
              info.executableCount = 0;
            }
          }
        } catch {
          info.readable = false;
        }
      } catch {
        // Path doesn't exist or can't be accessed
        info.exists = false;
      }

      return info;
    })
  );

  // Get some basic environment info
  const shellInfo = process.env.SHELL || 'Unknown';
  const userInfo = process.env.USER || 'Unknown';
  const pwdInfo = process.cwd();

  return {
    pathVariable: pathEnv,
    totalPaths: pathDirs.length,
    paths: pathInfo,
    shell: shellInfo,
    user: userInfo,
    workingDirectory: pwdInfo,
    existingPaths: pathInfo.filter(p => p.exists).length,
    readablePaths: pathInfo.filter(p => p.readable).length,
    debug: {
      serverPath: pathEnv
    }
  };
}

export const pathWorkflow = {
  getPathInfo
};
