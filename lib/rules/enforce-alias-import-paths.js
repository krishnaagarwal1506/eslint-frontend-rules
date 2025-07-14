/**
 * @fileoverview Enforces use of alias import paths instead of relative paths.
 *
 * This rule helps maintain consistent and readable import statements in your codebase by requiring the use of configured alias prefixes (e.g., '@/components/Button') rather than relative paths (e.g., '../../components/Button').
 *
 * Configuration:
 * You can specify allowed alias prefixes and ignore patterns in your ESLint configuration file.
 *
 * Example (.eslintrc.js):
 *
 *   rules: {
 *     'eslint-frontend-rules/enforce-alias-import-paths': [
 *       'error',
 *       {
 *         aliases: ['@', '@components', '@utils'],
 *         ignore: ['*.test.tsx']
 *       }
 *     ]
 *   }
 *
 * - aliases: Array of allowed alias prefixes for import paths.
 * - ignore: Array of glob patterns to ignore files or import paths.
 *
 * By default, the rule allows the '@' alias.
 */

const DEFAULT_ALIASES = ["@"];

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce use of alias import paths instead of relative paths. Supports configuration of allowed aliases and ignore patterns in your ESLint config.",
      category: "Best Practices",
    },
    messages: {
      noRelativeImport:
        'Relative import path "{{importPath}}" detected. Use an alias import path (e.g., {{aliases}}) instead.',
    },
    schema: [
      {
        type: "object",
        properties: {
          aliases: {
            type: "array",
            items: { type: "string" },
          },
          ignore: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    const aliases = options.aliases || DEFAULT_ALIASES;
    const ignorePatterns = options.ignore || [];
    let micromatch;
    if (ignorePatterns.length) {
      micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== "string") return;
        // Ignore node_modules and package imports
        if (!importPath.startsWith(".") && !importPath.startsWith("/")) return;
        // Ignore if matches ignorePatterns
        if (micromatch && micromatch.isMatch(importPath, ignorePatterns))
          return;
        // Check if path starts with alias

        if (aliases.some((alias) => importPath.startsWith(alias))) return;
        // Flag relative import
        context.report({
          node: node.source,
          messageId: "noRelativeImport",
          data: {
            importPath,
            aliases: aliases.join(", "),
          },
        });
      },
    };
  },
};

module.exports = rule;
