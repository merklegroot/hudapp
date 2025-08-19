import { NextResponse } from 'next/server';
import { detectPlatform, platformType } from '../../workflows/detectPlatform';
import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { homedir } from 'os';

interface ProfileFile {
  path: string;
  description: string;
  exists: boolean;
  isMainProfile?: boolean;
}

interface ProfileInfo {
  platform: string;
  platformType: platformType;
  distroInfo?: string;
  distroFamily?: string;
  profileFiles?: ProfileFile[];
  profileInstructions: {
    title: string;
    description: string;
    methods: {
      name: string;
      description: string;
      steps: string[];
    }[];
  };
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function getLinuxDistroInfo(): Promise<{ distroName: string; distroFamily: string }> {
  try {
    // Try to read from /etc/os-release for detailed OS information
    const osRelease = await readFile('/etc/os-release', 'utf8');
    const lines = osRelease.split('\n');
    
    let prettyName = '';
    let name = '';
    let version = '';
    let idLike = '';
    
    for (const line of lines) {
      if (line.startsWith('PRETTY_NAME=')) {
        prettyName = line.split('=')[1].replace(/"/g, '');
      } else if (line.startsWith('NAME=')) {
        name = line.split('=')[1].replace(/"/g, '');
      } else if (line.startsWith('VERSION=')) {
        version = line.split('=')[1].replace(/"/g, '');
      } else if (line.startsWith('ID_LIKE=')) {
        idLike = line.split('=')[1].replace(/"/g, '');
      }
    }
    
    const distroName = prettyName || (name + (version ? ` ${version}` : '')) || 'Unknown Linux Distribution';
    
    // Determine distro family
    let distroFamily = 'unknown';
    const nameLower = name.toLowerCase();
    const idLikeLower = idLike.toLowerCase();
    
    if (nameLower.includes('ubuntu') || nameLower.includes('debian') || nameLower.includes('mint') || 
        nameLower.includes('elementary') || nameLower.includes('pop') || idLikeLower.includes('debian')) {
      distroFamily = 'debian';
    } else if (nameLower.includes('fedora') || nameLower.includes('rhel') || nameLower.includes('centos') || 
               nameLower.includes('rocky') || nameLower.includes('alma') || idLikeLower.includes('rhel') || 
               idLikeLower.includes('fedora')) {
      distroFamily = 'redhat';
    } else if (nameLower.includes('arch') || nameLower.includes('manjaro') || idLikeLower.includes('arch')) {
      distroFamily = 'arch';
    } else if (nameLower.includes('opensuse') || nameLower.includes('suse') || idLikeLower.includes('suse')) {
      distroFamily = 'suse';
    }
    
    return { distroName, distroFamily };
  } catch {
    // Fallback methods
    try {
      const lsbRelease = await readFile('/etc/lsb-release', 'utf8');
      const lines = lsbRelease.split('\n');
      let distroId = '';
      let distroRelease = '';
      
      for (const line of lines) {
        if (line.startsWith('DISTRIB_ID=')) {
          distroId = line.split('=')[1];
        } else if (line.startsWith('DISTRIB_RELEASE=')) {
          distroRelease = line.split('=')[1];
        }
      }
      
      const distroName = distroId + (distroRelease ? ` ${distroRelease}` : '') || 'Unknown Linux Distribution';
      let distroFamily = 'unknown';
      
      if (distroId.toLowerCase().includes('ubuntu') || distroId.toLowerCase().includes('debian')) {
        distroFamily = 'debian';
      }
      
      return { distroName, distroFamily };
    } catch {
      return { distroName: 'Unknown Linux Distribution', distroFamily: 'unknown' };
    }
  }
}

async function getLinuxProfileFiles(distroFamily: string): Promise<ProfileFile[]> {
  const homeDir = homedir();
  const profileFiles: { path: string; description: string; isMainProfile?: boolean }[] = [];
  
  // Common files for all Linux systems
  profileFiles.push(
    { path: `${homeDir}/.profile`, description: "POSIX-compliant profile (login shells)", isMainProfile: true },
    { path: `${homeDir}/.bashrc`, description: "Bash interactive shell configuration" }
  );
  
  // Distro-specific primary profile files
  switch (distroFamily) {
    case 'debian':
      // Ubuntu/Debian typically use .profile and .bashrc
      profileFiles.push(
        { path: `${homeDir}/.bash_profile`, description: "Bash login shell profile (if exists, overrides .profile)" },
        { path: `${homeDir}/.pam_environment`, description: "Environment variables (PAM-based systems)" }
      );
      break;
      
    case 'redhat':
      // Red Hat family prefers .bash_profile for login shells
      profileFiles.unshift(
        { path: `${homeDir}/.bash_profile`, description: "Bash login shell profile (primary on Red Hat systems)", isMainProfile: true }
      );
      break;
      
    case 'arch':
      // Arch commonly uses zsh, but also supports bash
      profileFiles.push(
        { path: `${homeDir}/.bash_profile`, description: "Bash login shell profile" },
        { path: `${homeDir}/.zshrc`, description: "Zsh configuration (if using zsh shell)" },
        { path: `${homeDir}/.zprofile`, description: "Zsh login shell profile" }
      );
      break;
      
    case 'suse':
      // openSUSE uses standard locations
      profileFiles.push(
        { path: `${homeDir}/.bash_profile`, description: "Bash login shell profile" }
      );
      break;
  }
  
  // Check which files exist
  const profileFilesWithExistence: ProfileFile[] = [];
  for (const file of profileFiles) {
    const exists = await checkFileExists(file.path);
    profileFilesWithExistence.push({
      ...file,
      exists
    });
  }
  
  return profileFilesWithExistence;
}

function getProfileInstructions(platform: platformType): ProfileInfo['profileInstructions'] {
  switch (platform) {
    case platformType.windows:
      return {
        title: "Windows Profile Management",
        description: "On Windows, you can edit your user profile through several methods:",
        methods: [
          {
            name: "User Accounts Control Panel",
            description: "The easiest way to manage your profile",
            steps: [
              "Press Win + R and type 'netplwiz' or 'control userpasswords2'",
              "Select your user account and click 'Properties'",
              "Edit your user information as needed"
            ]
          },
          {
            name: "Settings App",
            description: "Modern Windows settings interface",
            steps: [
              "Press Win + I to open Settings",
              "Go to Accounts > Your info",
              "Click 'Manage my Microsoft account' or edit local account info"
            ]
          },
          {
            name: "Registry Editor (Advanced)",
            description: "For advanced users only",
            steps: [
              "Press Win + R and type 'regedit'",
              "Navigate to HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer",
              "Modify profile-related registry entries (be very careful!)"
            ]
          }
        ]
      };

    case platformType.mac:
      return {
        title: "macOS Profile Management",
        description: "On macOS, you can edit your user profile through these methods:",
        methods: [
          {
            name: "System Preferences",
            description: "The standard way to manage your profile",
            steps: [
              "Click the Apple menu and select 'System Preferences'",
              "Click 'Users & Groups'",
              "Select your user account and click the lock to make changes",
              "Edit your account information"
            ]
          },
          {
            name: "Terminal (Advanced)",
            description: "Command-line profile management",
            steps: [
              "Open Terminal",
              "Use 'dscl' command: dscl . -read /Users/$(whoami)",
              "Use 'sudo dscl' to modify user attributes",
              "Edit shell profile files like ~/.bash_profile or ~/.zshrc"
            ]
          }
        ]
      };

    case platformType.linux:
      return {
        title: "Linux Profile Management",
        description: "Your profile files are shown above with their current existence status. Edit the files that exist, or create them if needed.",
        methods: [
          {
            name: "How to Edit Profile Files",
            description: "Use any text editor to modify your profile files",
            steps: [
              "Command line editors: nano ~/.profile or vim ~/.bashrc",
              "GUI editors: gedit ~/.profile or kate ~/.bashrc (if available)",
              "VS Code: code ~/.profile (if VS Code is installed)",
              "After editing, reload with: source ~/.profile or source ~/.bashrc",
              "Or simply open a new terminal to load changes"
            ]
          },
          {
            name: "What Goes in Profile Files",
            description: "Common things you might want to add to your profile",
            steps: [
              "Environment variables: export PATH=$PATH:/new/path",
              "Aliases: alias ll='ls -la'",
              "Shell options: set -o vi (for vi editing mode)",
              "Functions: Define custom shell functions",
              "Startup commands: Commands to run when shell starts"
            ]
          }
        ]
      };

    default:
      return {
        title: "Profile Management",
        description: "Profile management varies by operating system. Here are some general approaches:",
        methods: [
          {
            name: "System Settings",
            description: "Most operating systems provide a settings interface",
            steps: [
              "Look for 'User Accounts', 'Users', or 'Profile' in system settings",
              "Access through system preferences or control panel",
              "Modify user information as permitted"
            ]
          },
          {
            name: "Command Line",
            description: "Advanced users can often use command-line tools",
            steps: [
              "Consult your operating system documentation",
              "Look for user management commands",
              "Be careful when modifying system files"
            ]
          }
        ]
      };
  }
}

function getPlatformName(platform: platformType): string {
  switch (platform) {
    case platformType.windows: return "Windows";
    case platformType.mac: return "macOS";
    case platformType.linux: return "Linux";
    case platformType.aix: return "AIX";
    case platformType.freebsd: return "FreeBSD";
    case platformType.openbsd: return "OpenBSD";
    case platformType.sunos: return "SunOS";
    case platformType.android: return "Android";
    default: return "Unknown";
  }
}

export async function GET(): Promise<NextResponse<ProfileInfo>> {
  try {
    const detectedPlatform = detectPlatform();
    const platformName = getPlatformName(detectedPlatform);
    const profileInstructions = getProfileInstructions(detectedPlatform);
    
    let distroInfo: string | undefined;
    let distroFamily: string | undefined;
    let profileFiles: ProfileFile[] | undefined;
    
    if (detectedPlatform === platformType.linux) {
      const linuxInfo = await getLinuxDistroInfo();
      distroInfo = linuxInfo.distroName;
      distroFamily = linuxInfo.distroFamily;
      profileFiles = await getLinuxProfileFiles(linuxInfo.distroFamily);
    }

    return NextResponse.json({
      platform: platformName,
      platformType: detectedPlatform,
      distroInfo,
      distroFamily,
      profileFiles,
      profileInstructions
    });
  } catch (error) {
    console.error('Error getting profile information:', error);
    return NextResponse.json({
      platform: "Unknown",
      platformType: platformType.unknown,
      profileInstructions: getProfileInstructions(platformType.unknown)
    });
  }
}
