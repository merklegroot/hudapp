import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface BuildInfo {
  buildTime: string;
  commitHash: string;
  commitShort: string;
  githubUrl: string;
}

export function getBuildInfo(): BuildInfo {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('getBuildInfo can only be called on the server side');
  }
  
  // Try to read from generated build info file first
  const buildInfoPath = path.join(process.cwd(), 'src', 'data', 'build-info.json');
  
  if (fs.existsSync(buildInfoPath)) {
    try {
      const buildInfoData = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
      // Convert ISO string to localized string for display
      const buildTime = new Date(buildInfoData.buildTime).toLocaleString();
      return {
        ...buildInfoData,
        buildTime
      };
    } catch (error) {
      console.warn('Could not read build info file:', error);
    }
  }
  
  // Fallback to runtime generation (for development)
  const buildTime = new Date().toLocaleString();
  
  let commitHash = '';
  let commitShort = '';
  
  try {
    commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('Could not get git commit info:', error);
    commitHash = 'unknown';
    commitShort = 'unknown';
  }
  
  const githubUrl = `https://github.com/merklegroot/hudapp/commit/${commitHash}`;
  
  return {
    buildTime,
    commitHash,
    commitShort,
    githubUrl
  };
}