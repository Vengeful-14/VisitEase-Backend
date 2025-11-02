module.exports = {
  apps: [
    {
      name: 'visitease-backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging configuration
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart configuration
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      
      // Advanced settings
      autorestart: true,
      max_cpu_restart: '80%',
      
      // Graceful shutdown
      kill_timeout: 5000,
      
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};


