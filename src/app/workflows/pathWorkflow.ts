import { spawnAndGetPathWorkflow } from './spawnAndGetPathWorkflow';

interface PathData {
  paths: string[];
}


async function getPathInfo(): Promise<PathData> {
  let pathEnv = '';
  
  pathEnv = await spawnAndGetPathWorkflow.executeWithFallback();
  if (!pathEnv)
    throw new Error('PATH environment variable not found');

  // Split the PATH into individual directories
  const pathDirs = pathEnv.split(':').filter(dir => dir.trim() !== '');
  
  return {
    paths: pathDirs
  };
}

export const pathWorkflow = {
  getPathInfo
};
