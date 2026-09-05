module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "object-curly-spacing": ["error", "always"],
    "max-len": ["error", { code: 120 }],
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-require-imports": "off",
    indent: "off",
    "linebreak-style": "off",
    "require-jsdoc": "off",
    "operator-linebreak": "off",
    "comma-dangle": "off",
    "quote-props": "off"
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true
      },
      rules: {}
    }
  ],
  globals: {}
};
