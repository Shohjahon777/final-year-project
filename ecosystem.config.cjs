/**
 * PM2 ecosystem config for Faculty Evaluation System.
 *
 * Usage (from project root, e.g. /var/www/faculty-evaluation):
 *   pm2 start ecosystem.config.cjs
 *
 * Prerequisites:
 *   - backend: npm run build, and backend/.env with MONGODB_URI, JWT_SECRET, FRONTEND_URL, etc.
 *   - frontend: npm run build, and frontend/.env.production with NEXT_PUBLIC_API_URL
 */

const path = require('path')
const projectRoot = __dirname

module.exports = {
  apps: [
    {
      name: 'api',
      cwd: path.join(projectRoot, 'backend'),
      script: 'dist/app.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      merge_logs: true,
      time: true,
    },
    {
      name: 'frontend',
      cwd: path.join(projectRoot, 'frontend'),
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      merge_logs: true,
      time: true,
    },
  ],
}
