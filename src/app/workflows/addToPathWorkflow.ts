
import { EOL } from 'os';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

interface addToPathProps {
    folderToAdd: string;
    profileFullPath: string;
}

async function execute({ folderToAdd, profileFullPath }: addToPathProps) {
    const textToAdd = getTextToAdd(folderToAdd);
    
    try {
        // Check if the profile file exists, create it if it doesn't
        if (!existsSync(profileFullPath)) {
            await fs.writeFile(profileFullPath, '', 'utf8');
        }
        
        // Read the current profile file
        const currentContent = await fs.readFile(profileFullPath, 'utf8');
        
        // Check if our dotnet PATH configuration already exists
        if (currentContent.includes('[hudapp_begin add_dotnet_to_path]')) {
            throw new Error('HudApp .NET PATH configuration already exists in the profile file');
        }
        
        // Create a timestamped backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupPath = `${profileFullPath}.hudapp_backup.${timestamp}`;
        await fs.copyFile(profileFullPath, backupPath);
        
        // Append the new PATH configuration
        const updatedContent = currentContent + EOL + textToAdd;
        await fs.writeFile(profileFullPath, updatedContent, 'utf8');
        
        return {
            success: true,
            backupPath,
            profilePath: profileFullPath,
            message: `Successfully added .NET to PATH in ${profileFullPath}. Backup created: ${backupPath}`
        };
        
    } catch (error) {
        throw new Error(`Failed to modify ${profileFullPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function getTextToAdd(folderToAdd: string) {
    // Generate the shell profile text to add dotnet to PATH
    // Uses conditional check to avoid duplicating PATH entries
    const lines = [
        '# [hudapp_begin add_dotnet_to_path]',
        '# Add .NET to the PATH',
        `if [ -d "${folderToAdd}" ] ; then`,
        `    PATH="${folderToAdd}:$PATH"`,
        'fi',
        '# [hudapp_end add_dotnet_to_path]',
        '' // Add blank line at the end
    ];
    
    return lines.join(EOL);
}

export const addToPathWorkflow = {
    execute
}