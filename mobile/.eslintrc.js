module.exports = {
  root: true,
  extends: [
    "expo",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-native/all"
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  plugins: ["react", "react-native"],
  rules: {
    "react-native/no-inline-styles": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-require-imports": "off"
  },
  ignorePatterns: ["/dist/*", "node_modules/"],
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
      env: {
        jest: true
      }
    }
  ]
};
