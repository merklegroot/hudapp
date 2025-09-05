import { detectPlatform } from './detectPlatform';

export interface CPUPerformanceData {
  model: string;
  vendor: string;
  passmarkScore?: number;
  geekbenchSingle?: number;
  geekbenchMulti?: number;
  cinebenchR23Single?: number;
  cinebenchR23Multi?: number;
  performanceRating: 'Low' | 'Below Average' | 'Average' | 'Above Average' | 'High' | 'Excellent';
  percentile: number; // 0-100 percentile ranking
  releaseYear?: number;
  price?: number;
  source: 'database' | 'api' | 'estimated';
}

export interface CPUPerformanceLookupResult {
  found: boolean;
  data?: CPUPerformanceData;
  suggestions?: string[];
  error?: string;
}

// CPU Performance Database - This would ideally be loaded from an external source
// For now, we'll include a representative sample of popular CPUs
const CPU_PERFORMANCE_DATABASE: Record<string, CPUPerformanceData> = {
  // Intel CPUs
  'Intel Core i9-13900K': {
    model: 'Intel Core i9-13900K',
    vendor: 'Intel',
    passmarkScore: 58000,
    geekbenchSingle: 2100,
    geekbenchMulti: 28000,
    cinebenchR23Single: 2200,
    cinebenchR23Multi: 38000,
    performanceRating: 'Excellent',
    percentile: 95,
    releaseYear: 2022,
    price: 589,
    source: 'database'
  },
  'Intel Core i7-13700K': {
    model: 'Intel Core i7-13700K',
    vendor: 'Intel',
    passmarkScore: 45000,
    geekbenchSingle: 2000,
    geekbenchMulti: 22000,
    cinebenchR23Single: 2000,
    cinebenchR23Multi: 28000,
    performanceRating: 'High',
    percentile: 85,
    releaseYear: 2022,
    price: 409,
    source: 'database'
  },
  'Intel Core i5-13600K': {
    model: 'Intel Core i5-13600K',
    vendor: 'Intel',
    passmarkScore: 35000,
    geekbenchSingle: 1900,
    geekbenchMulti: 18000,
    cinebenchR23Single: 1800,
    cinebenchR23Multi: 22000,
    performanceRating: 'Above Average',
    percentile: 75,
    releaseYear: 2022,
    price: 319,
    source: 'database'
  },
  'Intel Core i9-12900K': {
    model: 'Intel Core i9-12900K',
    vendor: 'Intel',
    passmarkScore: 42000,
    geekbenchSingle: 1950,
    geekbenchMulti: 25000,
    cinebenchR23Single: 1950,
    cinebenchR23Multi: 32000,
    performanceRating: 'High',
    percentile: 80,
    releaseYear: 2021,
    price: 589,
    source: 'database'
  },
  'Intel Core i7-12700K': {
    model: 'Intel Core i7-12700K',
    vendor: 'Intel',
    passmarkScore: 32000,
    geekbenchSingle: 1850,
    geekbenchMulti: 19000,
    cinebenchR23Single: 1850,
    cinebenchR23Multi: 24000,
    performanceRating: 'Above Average',
    percentile: 70,
    releaseYear: 2021,
    price: 409,
    source: 'database'
  },
  'Intel Core i5-12600K': {
    model: 'Intel Core i5-12600K',
    vendor: 'Intel',
    passmarkScore: 25000,
    geekbenchSingle: 1750,
    geekbenchMulti: 15000,
    cinebenchR23Single: 1750,
    cinebenchR23Multi: 18000,
    performanceRating: 'Average',
    percentile: 60,
    releaseYear: 2021,
    price: 289,
    source: 'database'
  },
  'Intel Core i9-11900K': {
    model: 'Intel Core i9-11900K',
    vendor: 'Intel',
    passmarkScore: 28000,
    geekbenchSingle: 1800,
    geekbenchMulti: 16000,
    cinebenchR23Single: 1800,
    cinebenchR23Multi: 20000,
    performanceRating: 'Above Average',
    percentile: 65,
    releaseYear: 2021,
    price: 539,
    source: 'database'
  },
  'Intel Core i7-11700K': {
    model: 'Intel Core i7-11700K',
    vendor: 'Intel',
    passmarkScore: 22000,
    geekbenchSingle: 1700,
    geekbenchMulti: 13000,
    cinebenchR23Single: 1700,
    cinebenchR23Multi: 16000,
    performanceRating: 'Average',
    percentile: 55,
    releaseYear: 2021,
    price: 399,
    source: 'database'
  },
  'Intel Core i5-11600K': {
    model: 'Intel Core i5-11600K',
    vendor: 'Intel',
    passmarkScore: 18000,
    geekbenchSingle: 1600,
    geekbenchMulti: 11000,
    cinebenchR23Single: 1600,
    cinebenchR23Multi: 14000,
    performanceRating: 'Average',
    percentile: 50,
    releaseYear: 2021,
    price: 262,
    source: 'database'
  },

  // AMD CPUs
  'AMD Ryzen 9 7950X': {
    model: 'AMD Ryzen 9 7950X',
    vendor: 'AMD',
    passmarkScore: 62000,
    geekbenchSingle: 2200,
    geekbenchMulti: 30000,
    cinebenchR23Single: 2200,
    cinebenchR23Multi: 40000,
    performanceRating: 'Excellent',
    percentile: 98,
    releaseYear: 2022,
    price: 699,
    source: 'database'
  },
  'AMD Ryzen 9 7900X': {
    model: 'AMD Ryzen 9 7900X',
    vendor: 'AMD',
    passmarkScore: 52000,
    geekbenchSingle: 2100,
    geekbenchMulti: 25000,
    cinebenchR23Single: 2100,
    cinebenchR23Multi: 32000,
    performanceRating: 'Excellent',
    percentile: 90,
    releaseYear: 2022,
    price: 549,
    source: 'database'
  },
  'AMD Ryzen 7 7700X': {
    model: 'AMD Ryzen 7 7700X',
    vendor: 'AMD',
    passmarkScore: 40000,
    geekbenchSingle: 2000,
    geekbenchMulti: 20000,
    cinebenchR23Single: 2000,
    cinebenchR23Multi: 25000,
    performanceRating: 'High',
    percentile: 80,
    releaseYear: 2022,
    price: 399,
    source: 'database'
  },
  'AMD Ryzen 5 7600X': {
    model: 'AMD Ryzen 5 7600X',
    vendor: 'AMD',
    passmarkScore: 30000,
    geekbenchSingle: 1900,
    geekbenchMulti: 16000,
    cinebenchR23Single: 1900,
    cinebenchR23Multi: 20000,
    performanceRating: 'Above Average',
    percentile: 70,
    releaseYear: 2022,
    price: 299,
    source: 'database'
  },
  'AMD Ryzen 9 5950X': {
    model: 'AMD Ryzen 9 5950X',
    vendor: 'AMD',
    passmarkScore: 48000,
    geekbenchSingle: 1900,
    geekbenchMulti: 24000,
    cinebenchR23Single: 1900,
    cinebenchR23Multi: 30000,
    performanceRating: 'High',
    percentile: 85,
    releaseYear: 2020,
    price: 799,
    source: 'database'
  },
  'AMD Ryzen 7 5800X': {
    model: 'AMD Ryzen 7 5800X',
    vendor: 'AMD',
    passmarkScore: 28000,
    geekbenchSingle: 1800,
    geekbenchMulti: 16000,
    cinebenchR23Single: 1800,
    cinebenchR23Multi: 20000,
    performanceRating: 'Above Average',
    percentile: 65,
    releaseYear: 2020,
    price: 449,
    source: 'database'
  },
  'AMD Ryzen 5 5600X': {
    model: 'AMD Ryzen 5 5600X',
    vendor: 'AMD',
    passmarkScore: 22000,
    geekbenchSingle: 1700,
    geekbenchMulti: 13000,
    cinebenchR23Single: 1700,
    cinebenchR23Multi: 16000,
    performanceRating: 'Average',
    percentile: 55,
    releaseYear: 2020,
    price: 299,
    source: 'database'
  },

  // Older/Entry Level CPUs
  'Intel Core i3-12100': {
    model: 'Intel Core i3-12100',
    vendor: 'Intel',
    passmarkScore: 12000,
    geekbenchSingle: 1400,
    geekbenchMulti: 5000,
    cinebenchR23Single: 1400,
    cinebenchR23Multi: 6000,
    performanceRating: 'Below Average',
    percentile: 30,
    releaseYear: 2022,
    price: 122,
    source: 'database'
  },
  'AMD Ryzen 3 3300X': {
    model: 'AMD Ryzen 3 3300X',
    vendor: 'AMD',
    passmarkScore: 10000,
    geekbenchSingle: 1300,
    geekbenchMulti: 4000,
    cinebenchR23Single: 1300,
    cinebenchR23Multi: 5000,
    performanceRating: 'Low',
    percentile: 20,
    releaseYear: 2020,
    price: 120,
    source: 'database'
  }
};

// Performance rating thresholds based on percentile
const PERFORMANCE_THRESHOLDS = {
  'Excellent': 90,
  'High': 80,
  'Above Average': 70,
  'Average': 50,
  'Below Average': 30,
  'Low': 0
};

function normalizeCPUModel(model: string): string {
  // Normalize CPU model names for better matching
  return model
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/@\d+\.\d+GHz/g, '') // Remove frequency info
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/\s+/g, ' ') // Normalize whitespace again
    .trim();
}

function findBestMatch(model: string): CPUPerformanceData | null {
  const normalizedModel = normalizeCPUModel(model);
  
  // Direct match
  if (CPU_PERFORMANCE_DATABASE[normalizedModel]) {
    return CPU_PERFORMANCE_DATABASE[normalizedModel];
  }

  // Try partial matches
  const modelWords = normalizedModel.toLowerCase().split(' ');
  let bestMatch: CPUPerformanceData | null = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(CPU_PERFORMANCE_DATABASE)) {
    const keyWords = key.toLowerCase().split(' ');
    let score = 0;

    // Count matching words
    for (const word of modelWords) {
      if (keyWords.some(keyWord => keyWord.includes(word) || word.includes(keyWord))) {
        score++;
      }
    }

    // Prefer exact vendor match
    if (data.vendor.toLowerCase() === modelWords[0]) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = data;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

function estimatePerformanceFromSpecs(model: string, cores: number, threads: number, frequency: string): CPUPerformanceData {
  // Extract frequency number
  const freqMatch = frequency.match(/(\d+\.?\d*)/);
  const baseFreq = freqMatch ? parseFloat(freqMatch[1]) : 3.0;
  
  // Rough estimation based on cores, threads, and frequency
  const estimatedPassmark = Math.round(cores * threads * baseFreq * 1000);
  const estimatedGeekbenchSingle = Math.round(baseFreq * 500);
  const estimatedGeekbenchMulti = Math.round(cores * threads * baseFreq * 200);
  
  // Determine performance rating based on estimated score
  let performanceRating: CPUPerformanceData['performanceRating'] = 'Low';
  let percentile = 10;

  if (estimatedPassmark > 50000) {
    performanceRating = 'Excellent';
    percentile = 95;
  } else if (estimatedPassmark > 35000) {
    performanceRating = 'High';
    percentile = 80;
  } else if (estimatedPassmark > 25000) {
    performanceRating = 'Above Average';
    percentile = 65;
  } else if (estimatedPassmark > 15000) {
    performanceRating = 'Average';
    percentile = 45;
  } else if (estimatedPassmark > 8000) {
    performanceRating = 'Below Average';
    percentile = 25;
  }

  return {
    model,
    vendor: model.toLowerCase().includes('intel') ? 'Intel' : 'AMD',
    passmarkScore: estimatedPassmark,
    geekbenchSingle: estimatedGeekbenchSingle,
    geekbenchMulti: estimatedGeekbenchMulti,
    performanceRating,
    percentile,
    source: 'estimated'
  };
}

export async function lookupCPUPerformance(
  model: string, 
  cores?: number, 
  threads?: number, 
  frequency?: string
): Promise<CPUPerformanceLookupResult> {
  try {
    // First try to find exact or close match in database
    const exactMatch = findBestMatch(model);
    
    if (exactMatch) {
      return {
        found: true,
        data: exactMatch
      };
    }

    // If no match found and we have specs, try to estimate
    if (cores && threads && frequency) {
      const estimatedData = estimatePerformanceFromSpecs(model, cores, threads, frequency);
      return {
        found: true,
        data: estimatedData,
        suggestions: [
          'Performance data estimated from specifications',
          'Consider running actual benchmarks for more accurate results'
        ]
      };
    }

    // No match found and no specs for estimation
    return {
      found: false,
      suggestions: [
        'CPU model not found in performance database',
        'Consider providing core count, thread count, and frequency for estimation',
        'Check if CPU model name is spelled correctly'
      ]
    };

  } catch (error) {
    return {
      found: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during lookup'
    };
  }
}

export async function getCPUPerformanceComparison(
  model: string,
  cores?: number,
  threads?: number,
  frequency?: string
): Promise<{
  current: CPUPerformanceData | null;
  better: CPUPerformanceData[];
  worse: CPUPerformanceData[];
  similar: CPUPerformanceData[];
}> {
  const lookupResult = await lookupCPUPerformance(model, cores, threads, frequency);
  
  if (!lookupResult.found || !lookupResult.data) {
    return {
      current: null,
      better: [],
      worse: [],
      similar: []
    };
  }

  const current = lookupResult.data;
  const allCPUs = Object.values(CPU_PERFORMANCE_DATABASE);
  
  const better = allCPUs
    .filter(cpu => cpu.passmarkScore && current.passmarkScore && cpu.passmarkScore > current.passmarkScore)
    .sort((a, b) => (b.passmarkScore || 0) - (a.passmarkScore || 0))
    .slice(0, 5);

  const worse = allCPUs
    .filter(cpu => cpu.passmarkScore && current.passmarkScore && cpu.passmarkScore < current.passmarkScore)
    .sort((a, b) => (a.passmarkScore || 0) - (b.passmarkScore || 0))
    .slice(0, 5);

  const similar = allCPUs
    .filter(cpu => {
      if (!cpu.passmarkScore || !current.passmarkScore) return false;
      const diff = Math.abs(cpu.passmarkScore - current.passmarkScore);
      return diff <= current.passmarkScore * 0.1; // Within 10% performance
    })
    .filter(cpu => cpu.model !== current.model)
    .slice(0, 3);

  return {
    current,
    better,
    worse,
    similar
  };
}

export const cpuPerformanceLookup = {
  lookupCPUPerformance,
  getCPUPerformanceComparison,
  getDatabaseStats: () => ({
    totalCPUs: Object.keys(CPU_PERFORMANCE_DATABASE).length,
    vendors: [...new Set(Object.values(CPU_PERFORMANCE_DATABASE).map(cpu => cpu.vendor))],
    performanceRatings: Object.values(CPU_PERFORMANCE_DATABASE).reduce((acc, cpu) => {
      acc[cpu.performanceRating] = (acc[cpu.performanceRating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  })
};
