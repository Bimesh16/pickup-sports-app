export const testConfig = {
  // Base URLs
  baseUrl: process.env.E2E_BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:8080',
  
  // Test timeouts
  timeouts: {
    default: 30000,
    long: 60000,
    short: 10000,
    api: 5000
  },
  
  // Test data
  testData: {
    users: {
      valid: {
        email: 'test@example.com',
        password: 'password123'
      },
      admin: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    },
    games: {
      football: {
        sport: 'Football',
        venue: 'Kathmandu Sports Complex',
        price: 500
      }
    }
  },
  
  // Performance thresholds
  performance: {
    lcp: 2500, // Largest Contentful Paint < 2.5s
    fid: 100,  // First Input Delay < 100ms
    cls: 0.1,  // Cumulative Layout Shift < 0.1
    tti: 4000, // Time to Interactive < 4s
    fcp: 2500, // First Contentful Paint < 2.5s
    bundleSize: 500000, // Bundle size < 500KB
    memoryUsage: 50000000 // Memory usage < 50MB
  },
  
  // Lighthouse thresholds
  lighthouse: {
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 80,
    pwa: 80
  },
  
  // Network conditions
  network: {
    slow3G: {
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8,   // 500 Kbps
      latency: 400
    },
    fast3G: {
      downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
      uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
      latency: 150
    }
  },
  
  // Browser configurations
  browsers: {
    chromium: {
      headless: process.env.CI === 'true',
      viewport: { width: 1280, height: 720 }
    },
    firefox: {
      headless: process.env.CI === 'true',
      viewport: { width: 1280, height: 720 }
    },
    webkit: {
      headless: process.env.CI === 'true',
      viewport: { width: 1280, height: 720 }
    },
    mobile: {
      headless: process.env.CI === 'true',
      viewport: { width: 375, height: 667 }
    }
  },
  
  // Test retry configuration
  retry: {
    attempts: process.env.CI === 'true' ? 2 : 0,
    delay: 1000
  },
  
  // Screenshot configuration
  screenshots: {
    enabled: true,
    path: 'test-results/screenshots/',
    fullPage: true,
    onFailure: true
  },
  
  // Video configuration
  video: {
    enabled: process.env.CI === 'true',
    path: 'test-results/videos/',
    onFailure: true
  },
  
  // Trace configuration
  trace: {
    enabled: process.env.CI === 'true',
    path: 'test-results/traces/',
    onFailure: true
  },
  
  // Mock configuration
  mocks: {
    api: {
      enabled: true,
      baseUrl: 'http://localhost:8080'
    },
    websocket: {
      enabled: true,
      url: 'wss://api.pickupsports.com/ws'
    }
  },
  
  // Test environment variables
  env: {
    NODE_ENV: 'test',
    CI: process.env.CI || 'false',
    E2E_BASE_URL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    API_URL: process.env.API_URL || 'http://localhost:8080',
    SLOW_3G: process.env.SLOW_3G || 'false'
  }
};
