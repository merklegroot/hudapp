import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

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
  source: string;
  debug: {
    serverPath: string;
    methods: any;
    selectedMethod: string;
  };
}

async function getPathInfo(forceMethod?: string): Promise<PathData> {
  // Get the user's actual PATH from their login shell
  let pathEnv = '';
  let serverPathEnv = process.env.PATH || '';
  let debugInfo: any = {};
  
  try {
    // Try multiple methods to get the cleanest user PATH
    const methods = [
      { name: 'bash_login', cmd: 'bash -l -c "echo $PATH"' },
      { name: 'env_clean', cmd: 'env -i bash -l -c "echo $PATH"' },
      { name: 'su_user', cmd: `su - ${process.env.USER || 'goose'} -c "echo \\$PATH"` },
      { name: 'direct_source', cmd: 'bash -c "source ~/.bashrc && echo $PATH"' },
      { name: 'minimal_path', cmd: 'env -i PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" bash -c "echo $PATH"' },
      { name: 'system_default', cmd: 'getconf PATH' },
      { name: 'no_profile', cmd: `bash --noprofile --norc -c "echo \\$PATH"` },
      { name: 'true_user', cmd: `sudo -u ${process.env.USER || 'goose'} -i bash -c "echo \\$PATH"` }
    ];
    
    for (const method of methods) {
      try {
        const { stdout } = await execAsync(method.cmd);
        debugInfo[method.name] = stdout.trim();
      } catch (error) {
        debugInfo[method.name] = `Error: ${error}`;
      }
    }
    
    // Use forced method if specified, otherwise use the cleanest looking PATH
    if (forceMethod && debugInfo[forceMethod] && !debugInfo[forceMethod].startsWith('Error:')) {
      pathEnv = debugInfo[forceMethod];
    } else {
      // Prioritize methods that bypass config files
      pathEnv = debugInfo.system_default || 
                debugInfo.minimal_path || 
                debugInfo.no_profile || 
                debugInfo.true_user || 
                debugInfo.env_clean || 
                debugInfo.su_user || 
                debugInfo.bash_login || 
                serverPathEnv;
    }
    
  } catch (error) {
    console.error('Error getting user PATH:', error);
    pathEnv = serverPathEnv;
  }
  
  if (!pathEnv) {
    throw new Error('PATH environment variable not found');
  }

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

  // Get some additional environment info
  let shellInfo = '';
  try {
    const { stdout } = await execAsync('bash -l -c "echo $SHELL"');
    shellInfo = stdout.trim();
  } catch {
    shellInfo = 'Unknown';
  }

  // Get additional user environment info
  let userInfo = '';
  let pwdInfo = '';
  try {
    const { stdout: userStdout } = await execAsync('bash -l -c "whoami"');
    userInfo = userStdout.trim();
  } catch {
    userInfo = 'Unknown';
  }

  try {
    const { stdout: pwdStdout } = await execAsync('bash -l -c "pwd"');
    pwdInfo = pwdStdout.trim();
  } catch {
    pwdInfo = 'Unknown';
  }

  return {
    pathVariable: pathEnv,
    totalPaths: pathDirs.length,
    paths: pathInfo,
    shell: shellInfo,
    user: userInfo,
    workingDirectory: pwdInfo,
    existingPaths: pathInfo.filter(p => p.exists).length,
    readablePaths: pathInfo.filter(p => p.readable).length,
    source: 'user_login_shell',
    debug: {
      serverPath: serverPathEnv,
      methods: debugInfo,
      selectedMethod: forceMethod && debugInfo[forceMethod] === pathEnv ? `${forceMethod} (forced)` :
                    pathEnv === debugInfo.system_default ? 'system_default' :
                    pathEnv === debugInfo.minimal_path ? 'minimal_path' :
                    pathEnv === debugInfo.no_profile ? 'no_profile' :
                    pathEnv === debugInfo.true_user ? 'true_user' :
                    pathEnv === debugInfo.env_clean ? 'env_clean' : 
                    pathEnv === debugInfo.su_user ? 'su_user' : 
                    pathEnv === debugInfo.bash_login ? 'bash_login' : 
                    pathEnv === serverPathEnv ? 'server_fallback' : 'unknown'
    }
  };
}

export const pathWorkflow = {
  getPathInfo
};
