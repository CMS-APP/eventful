const path = require("path");

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add resolver configuration for alias imports
config.resolver.alias = {
  "@": path.resolve(__dirname, "src")
};

module.exports = config;
