// next.config.js
module.exports = {
    serverRuntimeConfig: {
      // Will only be available on the server side
      PROJECT_ROOT: __dirname,
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback.fs = false;
      }
      return config;
    },
  }