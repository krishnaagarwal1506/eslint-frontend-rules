// ESLint rule: Enforce kebab-case format for file names.
// Only applies to .js, .ts, .jsx, .tsx files by default.

function isKebabCaseName(name) {
  // Only check the part before the first dot
  const base = name.split(".")[0];
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(base);
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce kebab-case format for file names (e.g., my-component.tsx)",
      category: "Best Practices",
    },
    messages: {
      notKebabCase:
        'File name "{{filename}}" should be in kebab-case (e.g., my-component.tsx).',
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: { type: "string" },
          },
          extensions: {
            type: "array",
            items: { type: "string" },
            default: [".js", ".ts", ".jsx", ".tsx"],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename;
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    const extensions = options.extensions || [".js", ".ts", ".jsx", ".tsx"];
    const micromatch = require("micromatch");
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};
    // `context.filename` uses the OS-native separator — on Windows that's
    // `\`. Splitting on `/` only left the whole absolute path un-split there,
    // so every file was checked (and failed) as if its "basename" were the
    // entire path. Match either separator.
    const base = filename.split(/[\\/]/).pop();
    if (!base || !extensions.some((ext) => base.endsWith(ext))) return {};
    if (!isKebabCaseName(base)) {
      context.report({
        loc: { line: 1, column: 0 },
        messageId: "notKebabCase",
        data: { filename: base },
      });
    }
    return {};
  },
};

module.exports = rule;
