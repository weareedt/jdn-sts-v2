module.exports = {
  apps: [{
    name: 'jdn-relay',
    script: 'server/https-server.js',
    watch: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // Ensure proper permissions for SSL certificates
    exec_mode: 'fork',
    exp_backoff_restart_delay: 100,
    max_restarts: 10
  }]
}
