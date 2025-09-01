#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating build info...');

try {
  // Get build time
  const buildTime = new Date().toISOString();
  
  // Get git commit info
  let commitHash = '';
  let commitShort = '';
  
  try {
    commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('Could not get git commit info:', error.message);
    commitHash = 'unknown';
    commitShort = 'unknown';
  }
  
  // Create build info object
  const buildInfo = {
    buildTime,
    commitHash,
    commitShort,
    githubUrl: `https://github.com/merklegroot/hudapp/commit/${commitHash}`
  };
  
  // Write build info to a JSON file
  const buildInfoPath = path.join(__dirname, '..', 'src', 'data', 'build-info.json');
  const buildInfoDir = path.dirname(buildInfoPath);
  
  // Ensure directory exists
  if (!fs.existsSync(buildInfoDir)) {
    fs.mkdirSync(buildInfoDir, { recursive: true });
  }
  
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  
  console.log('Build info generated:', {
    buildTime,
    commitShort,
    githubUrl: buildInfo.githubUrl
  });
  
} catch (error) {
  console.error('Error generating build info:', error);
  process.exit(1);
}

console.log('Running Next.js build...');

// Run the actual Next.js build
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}