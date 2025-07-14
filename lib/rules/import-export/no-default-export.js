// ESLint rule: Disallow default exports; enforce named exports only for better clarity and refactoring.

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow default exports; enforce named exports only.",
      category: "Best Practices",
    },
    messages: {
      noDefaultExport:
        "Default export is not allowed. Use named exports instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
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
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    return {
      ExportDefaultDeclaration(node) {
        context.report({
          node,
          messageId: "noDefaultExport",
        });
      },
    };
  },
};

module.exports = rule;
