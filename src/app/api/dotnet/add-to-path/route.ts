import { NextRequest, NextResponse } from 'next/server';
import { addToPathWorkflow } from '@/app/workflows';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

function detectShellProfile(): string {
  const homeDir = homedir();
  const profiles = [
    join(homeDir, '.zshrc'),
    join(homeDir, '.bashrc'),
    join(homeDir, '.profile')
  ];
  
  // Return the first existing profile, or default to .bashrc
  for (const profile of profiles) {
    if (existsSync(profile)) {
      return profile;
    }
  }
  
  // If none exist, default to .bashrc (will be created)
  return join(homeDir, '.bashrc');
}

export async function POST(request: NextRequest) {
  try {
    const { dotnetPath } = await request.json();

    if (!dotnetPath) {
      return NextResponse.json(
        { error: 'dotnetPath is required' },
        { status: 400 }
      );
    }

    // Detect the appropriate shell profile path
    const profileFullPath = detectShellProfile();

    // Call the workflow to add dotnet to PATH
    const result = await addToPathWorkflow.execute({
      folderToAdd: dotnetPath,
      profileFullPath
    });

    return NextResponse.json({ 
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error adding dotnet to PATH:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to PATH' },
      { status: 500 }
    );
  }
}
