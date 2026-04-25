module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022, // Upgrade to latest ECMAScript version for modern features
    sourceType: "module", // Enables ESM (import/export)
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { allowTemplateLiterals: true }],
    "object-curly-spacing": ["error", "always"], // Fixes spacing issue
    "max-len": ["error", { code: 120 }], // Increases line length limit
    "@typescript-eslint/no-unused-vars": "off", // Removes false unused variable errors
    "@typescript-eslint/no-require-imports": "off", // Allows require() if needed
    "indent": "off", // Makes space indents not matter,
    "linebreak-style": "off",
    "require-jsdoc": "off",
    "operator-linebreak": "off", // Disables operator linebreak rule
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
