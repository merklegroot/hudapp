import { gpuParser } from '../app/workflows/gpuParser';

describe('gpuParser', () => {
  describe('parseLspciOutput', () => {
    it('should correctly parse real lspci output with multiple GPUs', () => {
      // Sanitized lspci output based on real system data
      const realLspciOutput = `01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1) (prog-if 00 [VGA controller])
	Subsystem: Example Manufacturer Device 1234
	Physical Slot: 0
	Flags: bus master, fast devsel, latency 0, IRQ XX, IOMMU group XX
	Memory at xxxxxxxx (32-bit, non-prefetchable) [size=16M]
	Memory at xxxxxxxxxx (64-bit, prefetchable) [size=4G]
	Memory at xxxxxxxxxx (64-bit, prefetchable) [size=32M]
	I/O ports at xxxx [size=128]
	Expansion ROM at xxxxxxxx [disabled] [size=512K]
	Capabilities: <access denied>
	Kernel driver in use: nouveau
	Kernel modules: nvidiafb, nouveau

06:00.0 Network controller: MEDIATEK Corp. MT7922 802.11ax PCI Express Wireless Network Adapter
	Subsystem: Example Manufacturer Wireless Device
	Flags: bus master, fast devsel, latency 0, IRQ XX, IOMMU group XX
	Memory at xxxxxxxxxx (64-bit, prefetchable) [size=1M]
	Memory at xxxxxxxx (64-bit, non-prefetchable) [size=32K]
	Capabilities: <access denied>
	Kernel driver in use: mt7921e
	Kernel modules: mt7921e
--
08:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Rembrandt [Radeon 680M] (rev 01) (prog-if 00 [VGA controller])
	Subsystem: Example Manufacturer Device 1234
	Flags: bus master, fast devsel, latency 0, IRQ XX, IOMMU group XX
	Memory at xxxxxxxxxx (64-bit, prefetchable) [size=256M]
	Memory at xxxxxxxxxx (64-bit, prefetchable) [size=2M]
	I/O ports at xxxx [size=256]
	Memory at xxxxxxxx (32-bit, non-prefetchable) [size=512K]
	Capabilities: <access denied>
	Kernel driver in use: amdgpu
	Kernel modules: amdgpu

08:00.1 Audio device: Advanced Micro Devices, Inc. [AMD/ATI] Rembrandt Radeon High Definition Audio Controller
	Subsystem: Advanced Micro Devices, Inc. [AMD/ATI] Rembrandt Radeon High Definition Audio Controller
	Flags: bus master, fast devsel, latency 0, IRQ XX, IOMMU group XX
	Memory at xxxxxxxx (32-bit, non-prefetchable) [size=16K]
	Capabilities: <access denied>
	Kernel driver in use: snd_hda_intel
	Kernel modules: snd_hda_intel

08:00.2 Encryption controller: Advanced Micro Devices, Inc. [AMD] Family 19h PSP/CCP
	Subsystem: Advanced Micro Devices, Inc. [AMD] Family 19h PSP/CCP`;

      const result = gpuParser.parseLspciOutput(realLspciOutput);

      // Should find exactly 2 GPUs (ignoring non-GPU devices)
      expect(result).toHaveLength(2);

      // Test NVIDIA GPU parsing
      const nvidiaGpu = result[0];
      expect(nvidiaGpu.index).toBe(0);
      expect(nvidiaGpu.name).toBe('NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile]');
      expect(nvidiaGpu.bus).toBe('01:00.0');
      expect(nvidiaGpu.revision).toBe('a1');
      expect(nvidiaGpu.driver).toBe('nouveau');

      // Test AMD GPU parsing
      const amdGpu = result[1];
      expect(amdGpu.index).toBe(1);
      expect(amdGpu.name).toBe('Advanced Micro Devices, Inc. [AMD/ATI] Rembrandt [Radeon 680M]');
      expect(amdGpu.bus).toBe('08:00.0');
      expect(amdGpu.revision).toBe('01');
      expect(amdGpu.driver).toBe('amdgpu');
    });

    it('should handle empty input', () => {
      const result = gpuParser.parseLspciOutput('');
      expect(result).toHaveLength(0);
    });

    it('should handle input with no GPU devices', () => {
      const nonGpuOutput = `06:00.0 Network controller: MEDIATEK Corp. MT7922 802.11ax PCI Express Wireless Network Adapter
	Subsystem: Example Manufacturer Wireless Device
	Flags: bus master, fast devsel, latency 0, IRQ XX, IOMMU group XX
	Memory at xxxxxxxxxx (64-bit, prefetchable) [size=1M]
	Memory at xxxxxxxx (64-bit, non-prefetchable) [size=32K]
	Capabilities: <access denied>
	Kernel driver in use: mt7921e
	Kernel modules: mt7921e`;

      const result = gpuParser.parseLspciOutput(nonGpuOutput);
      expect(result).toHaveLength(0);
    });

    it('should handle single GPU with no driver info', () => {
      const singleGpuOutput = `01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1) (prog-if 00 [VGA controller])
	Subsystem: Example Manufacturer Device 1234
	Physical Slot: 0
	Flags: bus master, fast devsel, latency 0, IRQ XX, IOMMU group XX
	Memory at xxxxxxxx (32-bit, non-prefetchable) [size=16M]
	Capabilities: <access denied>`;

      const result = gpuParser.parseLspciOutput(singleGpuOutput);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile]');
      expect(result[0].bus).toBe('01:00.0');
      expect(result[0].revision).toBe('a1');
      expect(result[0].driver).toBe('Unknown');
    });

    it('should handle GPU names that continue on the next line', () => {
      const wrappedNameOutput = `01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1
) (prog-if 00 [VGA controller])
	Subsystem: Example Manufacturer Device 1234
	Kernel driver in use: nouveau`;

      const result = gpuParser.parseLspciOutput(wrappedNameOutput);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile]');
      expect(result[0].bus).toBe('01:00.0');
      expect(result[0].revision).toBe('a1');
      expect(result[0].driver).toBe('nouveau');
    });

    it('should handle 3D controller and Display controller types', () => {
      const mixed3DDisplayOutput = `01:00.0 3D controller: NVIDIA Corporation GP106GL [Quadro P2000] (rev a1)
	Subsystem: NVIDIA Corporation GP106GL [Quadro P2000]
	Kernel driver in use: nvidia
--
02:00.0 Display controller: Intel Corporation UHD Graphics 630 (rev 02)
	Subsystem: Dell UHD Graphics 630
	Kernel driver in use: i915`;

      const result = gpuParser.parseLspciOutput(mixed3DDisplayOutput);
      expect(result).toHaveLength(2);
      
      expect(result[0].name).toBe('NVIDIA Corporation GP106GL [Quadro P2000]');
      expect(result[0].bus).toBe('01:00.0');
      expect(result[0].driver).toBe('nvidia');
      
      expect(result[1].name).toBe('Intel Corporation UHD Graphics 630');
      expect(result[1].bus).toBe('02:00.0');
      expect(result[1].driver).toBe('i915');
    });

    it('should properly clean device names of technical info', () => {
      const technicalInfoOutput = `01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1) (prog-if 00 [VGA controller])
	Kernel driver in use: nouveau`;

      const result = gpuParser.parseLspciOutput(technicalInfoOutput);
      expect(result).toHaveLength(1);
      // Should remove both (rev a1) and (prog-if 00 [VGA controller]) from the name
      expect(result[0].name).toBe('NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile]');
      expect(result[0].revision).toBe('a1'); // But revision should still be captured separately
    });
  });
});
