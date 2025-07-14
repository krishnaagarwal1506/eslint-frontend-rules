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
  },
};

plugin.configs = {
  recommended: {
    plugins: ["frontend-rules"], // Use plugin name as required by ESLint
    rules: {
      "frontend-rules/enforce-typography-components": "error",
      "frontend-rules/no-direct-colors": "error",
      "frontend-rules/top-level-const-snake": "error",
      "frontend-rules/no-focusable-non-interactive-elements": "error",
      "frontend-rules/enforce-kebab-case-filenames": "error",
      "frontend-rules/enforce-interface-type-naming": "error",
      "frontend-rules/no-default-export": "error",
      "frontend-rules/interface-type-required-first": "error",
      "frontend-rules/no-inline-arrow-functions-in-jsx": "warn",
      "frontend-rules/enforce-alias-import-paths": "warn",
      "frontend-rules/no-nested-component": "error",
    },
  },
};

module.exports = plugin;
