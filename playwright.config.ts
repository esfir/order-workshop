import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', timeout: 60000, use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium', channel: 'chrome', viewport: { width: 1280, height: 900 } }, webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: true } });
