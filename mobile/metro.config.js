const path = require("path");

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname, "src")
};

module.exports = config;
