import { 
  lookupCPUPerformance, 
  getCPUPerformanceComparison, 
  cpuPerformanceLookup,
  CPUPerformanceData 
} from '../app/workflows/cpuPerformanceLookup';

describe('CPU Performance Lookup', () => {
  describe('lookupCPUPerformance', () => {
    it('should find exact match for known CPU', async () => {
      const result = await lookupCPUPerformance('Intel Core i9-13900K');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.model).toBe('Intel Core i9-13900K');
      expect(result.data?.vendor).toBe('Intel');
      expect(result.data?.performanceRating).toBe('Excellent');
      expect(result.data?.percentile).toBe(95);
      expect(result.data?.passmarkScore).toBe(58000);
    });

    it('should find partial match for similar CPU model', async () => {
      const result = await lookupCPUPerformance('Intel Core i9-13900K @ 3.0GHz');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.model).toBe('Intel Core i9-13900K');
    });

    it('should estimate performance from specifications', async () => {
      const result = await lookupCPUPerformance('Unknown CPU Model', 8, 16, '3.5 GHz');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.source).toBe('estimated');
      expect(result.suggestions).toContain('Performance data estimated from specifications');
    });

    it('should return not found for unknown CPU without specs', async () => {
      const result = await lookupCPUPerformance('Completely Unknown CPU');
      
      expect(result.found).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.suggestions).toContain('CPU model not found in performance database');
    });

    it('should handle AMD CPUs', async () => {
      const result = await lookupCPUPerformance('AMD Ryzen 9 7950X');
      
      expect(result.found).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.vendor).toBe('AMD');
      expect(result.data?.performanceRating).toBe('Excellent');
    });

    it('should normalize CPU model names correctly', async () => {
      const testCases = [
        'Intel Core i7-13700K @ 3.4GHz',
        'Intel Core i7-13700K (3.4GHz)',
        'Intel  Core  i7-13700K  @  3.4GHz  ',
        'Intel Core i7-13700K'
      ];

      for (const model of testCases) {
        const result = await lookupCPUPerformance(model);
        expect(result.found).toBe(true);
        expect(result.data?.model).toBe('Intel Core i7-13700K');
      }
    });
  });

  describe('getCPUPerformanceComparison', () => {
    it('should return comparison data for known CPU', async () => {
      const result = await getCPUPerformanceComparison('Intel Core i5-13600K');
      
      expect(result.current).toBeDefined();
      expect(result.current?.model).toBe('Intel Core i5-13600K');
      expect(Array.isArray(result.better)).toBe(true);
      expect(Array.isArray(result.worse)).toBe(true);
      expect(Array.isArray(result.similar)).toBe(true);
    });

    it('should return better performing CPUs', async () => {
      const result = await getCPUPerformanceComparison('Intel Core i5-13600K');
      
      expect(result.better.length).toBeGreaterThan(0);
      result.better.forEach(cpu => {
        expect(cpu.passmarkScore).toBeGreaterThan(result.current?.passmarkScore || 0);
      });
    });

    it('should return worse performing CPUs', async () => {
      const result = await getCPUPerformanceComparison('Intel Core i9-13900K');
      
      expect(result.worse.length).toBeGreaterThan(0);
      result.worse.forEach(cpu => {
        expect(cpu.passmarkScore).toBeLessThan(result.current?.passmarkScore || Infinity);
      });
    });

    it('should return similar performing CPUs', async () => {
      const result = await getCPUPerformanceComparison('Intel Core i7-13700K');
      
      expect(result.similar.length).toBeGreaterThan(0);
      result.similar.forEach(cpu => {
        if (cpu.passmarkScore && result.current?.passmarkScore) {
          const diff = Math.abs(cpu.passmarkScore - result.current.passmarkScore);
          const threshold = result.current.passmarkScore * 0.1;
          expect(diff).toBeLessThanOrEqual(threshold);
        }
      });
    });

    it('should handle unknown CPU with estimation', async () => {
      const result = await getCPUPerformanceComparison('Unknown CPU', 8, 16, '3.5 GHz');
      
      expect(result.current).toBeDefined();
      expect(result.current?.source).toBe('estimated');
    });

    it('should return empty arrays for unknown CPU without specs', async () => {
      const result = await getCPUPerformanceComparison('Completely Unknown CPU');
      
      expect(result.current).toBeNull();
      expect(result.better).toEqual([]);
      expect(result.worse).toEqual([]);
      expect(result.similar).toEqual([]);
    });
  });

  describe('cpuPerformanceLookup utility functions', () => {
    it('should return database statistics', () => {
      const stats = cpuPerformanceLookup.getDatabaseStats();
      
      expect(stats.totalCPUs).toBeGreaterThan(0);
      expect(stats.vendors).toContain('Intel');
      expect(stats.vendors).toContain('AMD');
      expect(stats.performanceRatings).toBeDefined();
      expect(typeof stats.performanceRatings).toBe('object');
    });

    it('should have performance ratings for all CPUs', () => {
      const stats = cpuPerformanceLookup.getDatabaseStats();
      const totalCPUs = stats.totalCPUs;
      const totalRatings = Object.values(stats.performanceRatings).reduce((sum, count) => sum + count, 0);
      
      expect(totalRatings).toBe(totalCPUs);
    });
  });

  describe('Performance rating thresholds', () => {
    it('should correctly categorize performance ratings', async () => {
      const testCases: Array<{ score: number; expectedRating: string }> = [
        { score: 60000, expectedRating: 'Excellent' },
        { score: 45000, expectedRating: 'High' },
        { score: 30000, expectedRating: 'Above Average' },
        { score: 20000, expectedRating: 'Average' },
        { score: 10000, expectedRating: 'Below Average' },
        { score: 5000, expectedRating: 'Low' }
      ];

      for (const { score, expectedRating } of testCases) {
        // Calculate cores and threads to achieve the target score
        // Formula: estimatedPassmark = cores * threads * baseFreq * 1000
        // For 8 cores, 16 threads, we need: 8 * 16 * baseFreq * 1000 = score
        // So baseFreq = score / (8 * 16 * 1000) = score / 128000
        const baseFreq = score / 128000;
        const result = await lookupCPUPerformance('Test CPU', 8, 16, `${baseFreq} GHz`);
        expect(result.found).toBe(true);
        expect(result.data?.performanceRating).toBe(expectedRating);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle invalid input gracefully', async () => {
      const result = await lookupCPUPerformance('');
      
      expect(result.found).toBe(false);
      expect(result.suggestions).toBeDefined();
    });

    it('should handle malformed frequency strings', async () => {
      const result = await lookupCPUPerformance('Test CPU', 4, 8, 'invalid frequency');
      
      expect(result.found).toBe(true);
      expect(result.data?.source).toBe('estimated');
    });
  });
});
