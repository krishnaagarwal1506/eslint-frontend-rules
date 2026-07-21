/**
 * @fileoverview Enforces use of alias import paths instead of relative paths.
 *
 * This rule helps maintain consistent and readable import statements in your codebase by requiring the use of configured alias prefixes (e.g., '@/components/Button') rather than deep relative paths (e.g., '../../../components/Button').
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
 *         ignore: ['**\/*.test.tsx']
 *       }
 *     ]
 *   }
 *
 * - aliases: Array of allowed alias prefixes for import paths.
 * - ignore: Array of glob patterns matched against the *file being linted*
 *   (not the import path) to skip entirely — e.g. test files.
 * - allowSameDirectory (default true): a same-or-nested-directory import
 *   (`./sibling`, `./components/x`) is always allowed, regardless of depth.
 * - maxParentDepth (default 1): how many leading `../` segments are allowed
 *   before an import is flagged. `../sibling` (depth 1) is fine by default;
 *   `../../sibling` (depth 2) is flagged. Set to `0` to flag every `../`
 *   import, or `Infinity` to never flag on depth alone.
 *
 * By default, the rule allows the '@' alias. These defaults intentionally
 * only flag genuinely deep `../../../`-style staircases, not every relative
 * import — an earlier version flagged ALL relative imports (including
 * `./types` next to the importing file, or the app's own `./globals.css`),
 * which is idiomatic in most real codebases and just added noise.
 */

const DEFAULT_ALIASES = ["@"];

function parentDepth(importPath) {
  let depth = 0;
  let rest = importPath;
  while (rest.startsWith("../")) {
    depth += 1;
    rest = rest.slice(3);
  }
  return depth;
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce use of alias import paths instead of deep relative paths. Supports configuration of allowed aliases, same-directory allowance, parent-traversal depth, and file ignore patterns.",
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
          allowSameDirectory: { type: "boolean" },
          maxParentDepth: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename;
    const options = context.options[0] || {};
    const aliases = options.aliases || DEFAULT_ALIASES;
    const ignorePatterns = options.ignore || [];
    const allowSameDirectory = options.allowSameDirectory !== false;
    const maxParentDepth =
      typeof options.maxParentDepth === "number" ? options.maxParentDepth : 1;
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== "string") return;
        // Ignore node_modules and package imports
        if (!importPath.startsWith(".") && !importPath.startsWith("/")) return;
        // Check if path starts with a configured alias (rare for a relative
        // path, but respects custom aliases that happen to start with ".").
        if (aliases.some((alias) => importPath.startsWith(alias))) return;
        if (allowSameDirectory && !importPath.startsWith("..")) return;
        if (importPath.startsWith("..") && parentDepth(importPath) <= maxParentDepth)
          return;
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
