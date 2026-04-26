module.exports = {
  apps: [{
    name: 'esmeralda-api',
    script: 'server.js',
    cwd: '/opt/esmeralda-api',
    env: {
      PORT: 4100,
      ESMERALDA_TOKEN: 'esmeralda-max-2026'
    }
  }]
};
