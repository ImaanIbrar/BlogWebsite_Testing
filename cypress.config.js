const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3001',
    video: true, // Enable video recording for E2E tests
    videoUploadOnPasses: true // Upload videos for passing tests
  },
  env: {
    BACKEND: 'http://localhost:3001/api',
  },
})
