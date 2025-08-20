import { NextRequest, NextResponse } from 'next/server';
import { addToPathWorkflow } from '@/app/workflows';
import { homedir } from 'os';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { dotnetPath } = await request.json();

    if (!dotnetPath) {
      return NextResponse.json(
        { error: 'dotnetPath is required' },
        { status: 400 }
      );
    }

    // Determine the shell profile path
    // Default to .bashrc, but could be enhanced to detect the user's shell
    const profileFullPath = join(homedir(), '.bashrc');

    // Call the workflow to add dotnet to PATH
    await addToPathWorkflow.execute({
      folderToAdd: dotnetPath,
      profileFullPath
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error adding dotnet to PATH:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to PATH' },
      { status: 500 }
    );
  }
}
