import { 
  lookupCPUPerformance, 
  getCPUPerformanceComparison, 
  cpuPerformanceLookup,
  CPUPerformanceData 
} from '../app/workflows/cpuPerformanceLookup';

describe('CPU Performance Lookup', () => {
  describe('lookupCPUPerformance', () => {
    it('should return benchmark links for any CPU', async () => {
      const result = await lookupCPUPerformance('Intel Core i9-13900K');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.model).toBe('Intel Core i9-13900K');
      expect(result.data?.vendor).toBe('Intel');
      expect(result.data?.performanceRating).toBe('Unknown');
      expect(result.data?.source).toBe('links');
    });

    it('should preserve original CPU model name', async () => {
      const result = await lookupCPUPerformance('Intel Core i9-13900K @ 3.0GHz');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.model).toBe('Intel Core i9-13900K @ 3.0GHz');
    });

    it('should return links for any CPU with specs', async () => {
      const result = await lookupCPUPerformance('Unknown CPU Model', 8, 16, '3.5 GHz');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.source).toBe('links');
      expect(result.suggestions).toContain('Click the benchmark links below to view your CPU\'s scores');
    });

    it('should return links for unknown CPU without specs', async () => {
      const result = await lookupCPUPerformance('Completely Unknown CPU');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.source).toBe('links');
    });

    it('should handle AMD CPUs', async () => {
      const result = await lookupCPUPerformance('AMD Ryzen 9 7950X');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.vendor).toBe('AMD');
      expect(result.data?.performanceRating).toBe('Unknown');
    });

    it('should preserve original CPU model names', async () => {
      const testCases = [
        'Intel Core i7-13700K @ 3.4GHz',
        'Intel Core i7-13700K (3.4GHz)',
        'Intel  Core  i7-13700K  @  3.4GHz  ',
        'Intel Core i7-13700K'
      ];

      for (const model of testCases) {
        const result = await lookupCPUPerformance(model);
        expect(result.found).toBe(true);
        expect(result.data?.model).toBe(model);
      }
    });
  });

  describe('getCPUPerformanceComparison', () => {
    it('should return current CPU data with empty comparison arrays', async () => {
      const result = await getCPUPerformanceComparison('Intel Core i5-13600K');
      
      expect(result.current).toBeDefined();
      expect(result.current?.model).toBe('Intel Core i5-13600K');
      expect(Array.isArray(result.better)).toBe(true);
      expect(Array.isArray(result.worse)).toBe(true);
      expect(Array.isArray(result.similar)).toBe(true);
      expect(result.better.length).toBe(0);
      expect(result.worse.length).toBe(0);
      expect(result.similar.length).toBe(0);
    });

    it('should return empty arrays for any CPU', async () => {
      const result = await getCPUPerformanceComparison('Intel Core i9-13900K');
      
      expect(result.better.length).toBe(0);
      expect(result.worse.length).toBe(0);
      expect(result.similar.length).toBe(0);
    });

    it('should handle unknown CPU', async () => {
      const result = await getCPUPerformanceComparison('Unknown CPU', 8, 16, '3.5 GHz');
      
      expect(result.current).toBeDefined();
      expect(result.current?.source).toBe('links');
    });

    it('should return current CPU data for any input', async () => {
      const result = await getCPUPerformanceComparison('Completely Unknown CPU');
      
      expect(result.current).toBeDefined();
      expect(result.current?.model).toBe('Completely Unknown CPU');
      expect(result.better).toEqual([]);
      expect(result.worse).toEqual([]);
      expect(result.similar).toEqual([]);
    });
  });

  describe('cpuPerformanceLookup utility functions', () => {
    it('should return empty database statistics', () => {
      const stats = cpuPerformanceLookup.getDatabaseStats();
      
      expect(stats.totalCPUs).toBe(0);
      expect(stats.vendors).toEqual([]);
      expect(stats.performanceRatings).toEqual({});
    });
  });

  describe('Error handling', () => {
    it('should handle invalid input gracefully', async () => {
      const result = await lookupCPUPerformance('');
      
      expect(result.found).toBe(true);
      expect(result.data?.model).toBe('');
    });

    it('should handle malformed frequency strings', async () => {
      const result = await lookupCPUPerformance('Test CPU', 4, 8, 'invalid frequency');
      
      expect(result.found).toBe(true);
      expect(result.data?.source).toBe('links');
    });
  });
});
