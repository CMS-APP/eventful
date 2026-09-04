/** @type {import('@bacons/apple-targets').Config} */
module.exports = (config) => ({
  type: "widget",
  name: "EventfulWidget",
  displayName: "Eventful",
  icon: "../../src/assets/logos/eventful-logo.png",
  deploymentTarget: "17.0",
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"]
  }
});
