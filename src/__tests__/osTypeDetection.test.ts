import { detectPlatform, platformType } from '../app/workflows/detectPlatform';

// Mock the os module
jest.mock('os', () => ({
  platform: jest.fn()
}));

import { platform } from 'os';

describe('OS Type Detection', () => {
  const mockPlatform = platform as jest.MockedFunction<typeof platform>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect Windows correctly', () => {
    mockPlatform.mockReturnValue('win32');
    
    const result = detectPlatform();
    expect(result).toBe(platformType.windows);
  });

  it('should detect macOS correctly', () => {
    mockPlatform.mockReturnValue('darwin');
    
    const result = detectPlatform();
    expect(result).toBe(platformType.mac);
  });

  it('should detect Linux correctly', () => {
    mockPlatform.mockReturnValue('linux');
    
    const result = detectPlatform();
    expect(result).toBe(platformType.linux);
  });

  it('should detect FreeBSD correctly', () => {
    mockPlatform.mockReturnValue('freebsd');
    
    const result = detectPlatform();
    expect(result).toBe(platformType.freebsd);
  });

  it('should detect OpenBSD correctly', () => {
    mockPlatform.mockReturnValue('openbsd');
    
    const result = detectPlatform();
    expect(result).toBe(platformType.openbsd);
  });

  it('should return unknown for unsupported platforms', () => {
    mockPlatform.mockReturnValue('unknown-platform');
    
    const result = detectPlatform();
    expect(result).toBe(platformType.unknown);
  });

  it('should handle null platform gracefully', () => {
    mockPlatform.mockReturnValue(null as any);
    
    const result = detectPlatform();
    expect(result).toBe(platformType.unknown);
  });
});
