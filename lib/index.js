const plugin = {
  rules: {
    "enforce-typography-components": require("./rules/enforce-typography-components"),
    "no-direct-colors": require("./rules/no-direct-colors"),
    "top-level-const-snake": require("./rules/top-level-const-snake"),
    "no-focusable-non-interactive-elements": require("./rules/no-focusable-non-interactive-elements"),
    "enforce-kebab-case-filenames": require("./rules/enforce-kebab-case-filenames"),
    "enforce-interface-type-naming": require("./rules/enforce-interface-type-naming"),
    "no-default-export": require("./rules/no-default-export"),
    "no-inline-arrow-functions-in-jsx": require("./rules/no-inline-arrow-functions-in-jsx"),
  },
};

plugin.configs = {
  recommended: {
    plugins: {
      "eslint-frontend-rules": plugin,
    },
    rules: {
      "eslint-frontend-rules/enforce-typography-components": "error",
      "eslint-frontend-rules/no-direct-colors": "error",
      "eslint-frontend-rules/top-level-const-snake": "error",
      "eslint-frontend-rules/no-focusable-non-interactive-elements": "error",
      "eslint-frontend-rules/enforce-kebab-case-filenames": "error",
      "eslint-frontend-rules/enforce-interface-type-naming": "error",
      "eslint-frontend-rules/no-default-export": "error",
      "eslint-frontend-rules/no-inline-arrow-functions-in-jsx": "warn",
    },
  },
};

module.exports = plugin;
