const path = require("path");

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
    es6: true
  },
  plugins: ["react", "react-native"],
  rules: {
    "react-native/no-inline-styles": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-require-imports": "off"
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: path.join(__dirname, "tsconfig.json"),
        alwaysTryTypes: true
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
      }
    }
  },
  ignorePatterns: ["/dist/*", "node_modules/"]
};
