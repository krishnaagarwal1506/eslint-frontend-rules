const plugin = {
  rules: {
    // Design
    "enforce-typography-components": require("./rules/design/enforce-typography-components"),
    "no-direct-colors": require("./rules/design/no-direct-colors"),
    // Naming
    "top-level-const-snake": require("./rules/naming/top-level-const-snake"),
    "enforce-interface-type-naming": require("./rules/naming/enforce-interface-type-naming"),
    // Accessibility
    "no-focusable-non-interactive-elements": require("./rules/accessibility/no-focusable-non-interactive-elements"),
    // File Structure
    "enforce-kebab-case-filenames": require("./rules/file-structure/enforce-kebab-case-filenames"),
    // Import/Export
    "no-default-export": require("./rules/import-export/no-default-export"),
    "enforce-alias-import-paths": require("./rules/import-export/enforce-alias-import-paths"),
    // TypeScript
    "interface-type-required-first": require("./rules/typescript/interface-type-required-first"),
    // React
    "no-inline-arrow-functions-in-jsx": require("./rules/react/no-inline-arrow-functions-in-jsx"),
    "no-nested-component": require("./rules/react/no-nested-component"),
    "no-unnecessary-fragment": require("./rules/react/no-unnecessary-fragment"),
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
      "eslint-frontend-rules/interface-type-required-first": "error",
      "eslint-frontend-rules/no-inline-arrow-functions-in-jsx": "warn",
      "eslint-frontend-rules/enforce-alias-import-paths": "warn",
      "eslint-frontend-rules/no-nested-component": "error",
      "eslint-frontend-rules/no-unnecessary-fragment": "warn",
    },
  },
};

module.exports = plugin;
