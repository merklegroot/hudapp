import { gpuInfo } from "./models";

function parseLspciOutput(lspciOutput: string) {
    const sections = lspciOutput.split('--\n').filter(section => section.trim());
    const gpus: gpuInfo[] = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length > 0) {
        // Find the first line that contains VGA/3D/Display controller (the actual GPU line)
        let gpuLineIndex = -1;
        let firstLine = '';
        
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].match(/(?:VGA compatible controller|3D controller|Display controller):/i)) {
            gpuLineIndex = j;
            firstLine = lines[j];
            // Check if the device name continues on the next line (common with long names)
            if (j + 1 < lines.length && !lines[j + 1].includes(':') && !lines[j + 1].includes('Subsystem') && !lines[j + 1].includes('Flags')) {
              firstLine += lines[j + 1].trim();
            }
            break;
          }
        }
        
        // Skip this section if no GPU controller line found
        if (gpuLineIndex === -1) {
          continue;
        }
        
        // Parse bus ID and device info from the GPU line
        // Format: "01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1)"
        const busMatch = firstLine.match(/^([0-9a-f]{2}:[0-9a-f]{2}\.[0-9a-f])/i);
        const deviceMatch = firstLine.match(/(?:VGA compatible controller|3D controller|Display controller):\s*(.+)/i);
        const revMatch = firstLine.match(/\(rev\s+([a-f0-9]+)\)/i);
        
        const busId = busMatch ? busMatch[1] : 'Unknown';
        let deviceName = deviceMatch ? deviceMatch[1].trim() : 'Unknown GPU';
        const revision = revMatch ? revMatch[1] : 'Unknown';
        
        // Remove revision info from device name if it's included (anywhere in the string)
        deviceName = deviceName.replace(/\s*\(rev\s+[a-f0-9]+\).*$/i, '');
        // Remove (prog-if XX [...]) info if present
        deviceName = deviceName.replace(/\s*\(prog-if\s+[^)]+\).*$/i, '');
        
        // Try to find driver info in the section
        let driver = 'Unknown';
        for (const line of lines) {
          const driverMatch = line.match(/Kernel driver in use:\s*(.+)/i);
          if (driverMatch) {
            driver = driverMatch[1].trim();
            break;
          }
        }
        
        gpus.push({
          index: gpus.length, // Use gpus.length instead of i to ensure sequential indexing
          name: deviceName,
          bus: busId,
          revision: revision,
          driver: driver
        });
      }
    }

    return gpus;
}

export const gpuParser = {
    parseLspciOutput
};