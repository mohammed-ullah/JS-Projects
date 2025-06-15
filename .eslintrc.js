module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "linebreak-style": "off", // Allow Windows line endings
    "no-unused-vars": "warn",
    "no-console": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.js", "**/*.test.js"],
      env: {
        jest: true,
        browser: true,
      },
      parserOptions: {
        sourceType: "module", // Allow ES6 imports in test files
      },
    },
  ],
};
