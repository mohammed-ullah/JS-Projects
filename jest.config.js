module.exports = {
    // Test environment
    testEnvironment: 'node',
    
    // Test file patterns
    testMatch: [
      '**/tests/unit/**/*.test.js',
      '**/tests/unit/**/*.spec.js'
    ],
    
    // Coverage settings
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/index.js',  // Exclude main entry file from coverage
      '!**/node_modules/**'
    ],
    
    // Coverage output directory
    coverageDirectory: 'coverage',
    
    // Coverage reporters
    coverageReporters: [
      'text',
      'lcov',
      'html'
    ],
    
    // Coverage thresholds (optional)
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Verbose output
    verbose: true
  };