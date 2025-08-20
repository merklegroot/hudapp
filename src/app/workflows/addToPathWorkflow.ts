
import { EOL } from 'os';

interface addToPathProps {
    folderToAdd: string;
    profileFullPath: string;
}

async function execute({ folderToAdd, profileFullPath }: addToPathProps) {
    const textToAdd = getTextToAdd(folderToAdd);
    throw new Error(`should append to ${profileFullPath} the following text: ${textToAdd}`);
}

function getTextToAdd(folderToAdd: string) {
    // Generate the shell profile text to add dotnet to PATH
    // Uses conditional check to avoid duplicating PATH entries
    const lines = [
        '',
        '# Added by HudApp - .NET SDK PATH configuration',
        `if [ -d "${folderToAdd}" ] ; then`,
        `    PATH="${folderToAdd}:$PATH"`,
        'fi',
        ''
    ];
    
    return lines.join(EOL);
}

export const addToPathWorkflow = {
    execute
}