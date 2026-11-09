// Lighthouse CI over the production build (`npm run build`, then `npm run lighthouse`).
// Serves `dist/` itself. Scores are asserted as floors; the report is written to
// `.lighthouseci/` (gitignored) and uploaded as a CI artifact, never to a public store.
// CHROME_PATH must point at a Chrome binary; CI uses Playwright's Chromium.
module.exports = {
  ci: {
    collect: {
      staticDistDir: 'dist',
      url: ['http://localhost/index.html'],
      numberOfRuns: 1,
      settings: {
        // The game is a phone-first page; Lighthouse's default mobile profile is right.
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Performance varies with the runner; warn below 0.9 instead of failing the gate.
        'categories:performance': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
