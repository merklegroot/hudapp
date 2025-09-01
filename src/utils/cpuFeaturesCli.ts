#!/usr/bin/env node

import { detectCPUFeatures, getBasicCPUInfo } from './cpuFeatures';

function displayCPUFeatures() {
  console.log('🔍 Detecting CPU features...\n');
  
  try {
    // Get basic info
    const basic = getBasicCPUInfo();
    console.log('📊 Basic CPU Information:');
    console.log('========================');
    console.log(`Model: ${basic.model}`);
    console.log(`Architecture: ${basic.architecture}`);
    console.log(`Platform: ${basic.platform}`);
    console.log(`Cores: ${basic.cores}`);
    console.log(`Speed: ${typeof basic.speed === 'number' ? `${basic.speed} MHz` : basic.speed}`);
    console.log(`Endianness: ${basic.endianness}`);
    console.log('');
    
    // Get detailed features
    const features = detectCPUFeatures();
    console.log('🚀 CPU Features & Instructions:');
    console.log('===============================');
    
    // SSE Instructions
    console.log('\nSSE Instructions:');
    console.log(`  SSE:     ${features.sse ? '✅' : '❌'}`);
    console.log(`  SSE2:    ${features.sse2 ? '✅' : '❌'}`);
    console.log(`  SSE3:    ${features.sse3 ? '✅' : '❌'}`);
    console.log(`  SSSE3:   ${features.ssse3 ? '✅' : '❌'}`);
    console.log(`  SSE4.1:  ${features.sse4_1 ? '✅' : '❌'}`);
    console.log(`  SSE4.2:  ${features.sse4_2 ? '✅' : '❌'}`);
    
    // Advanced Vector Extensions
    console.log('\nAdvanced Vector Extensions:');
    console.log(`  AVX:     ${features.avx ? '✅' : '❌'}`);
    console.log(`  AVX2:    ${features.avx2 ? '✅' : '❌'}`);
    console.log(`  AVX-512: ${features.avx512 ? '✅' : '❌'}`);
    
    // Other Features
    console.log('\nOther Features:');
    console.log(`  FMA:     ${features.fma ? '✅' : '❌'}`);
    console.log(`  AES-NI:  ${features.aes ? '✅' : '❌'}`);
    console.log(`  SHA-NI:  ${features.sha ? '✅' : '❌'}`);
    console.log(`  NEON:    ${features.neon ? '✅' : '❌'}`);
    
    // Raw flags
    if (features.flags) {
      console.log('\nCPU Flags:');
      console.log('==========');
      console.log(features.flags);
    }
    
  } catch (error) {
    console.error('❌ Error detecting CPU features:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  displayCPUFeatures();
}

export { displayCPUFeatures };