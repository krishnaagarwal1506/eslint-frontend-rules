// ESLint rule: Disallow default exports; enforce named exports only for better clarity and refactoring.

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow default exports; enforce named exports only.",
      category: "Best Practices",
    },
    fixable: "code",
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
    const filename = context.filename;
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    return {
      ExportDefaultDeclaration(node) {
        const declaration = node.declaration;
        context.report({
          node,
          messageId: "noDefaultExport",
          fix(fixer) {
            // export default function Foo() {} → export function Foo() {}
            if (
              (declaration.type === "FunctionDeclaration" ||
                declaration.type === "ClassDeclaration") &&
              declaration.id
            ) {
              const sourceCode = context.sourceCode;
              const defaultToken = sourceCode.getFirstToken(node, {
                skip: 0,
              });
              const nextToken = sourceCode.getTokenAfter(defaultToken);
              // Remove "default " between "export" and the declaration keyword
              if (
                defaultToken.value === "export" &&
                nextToken.value === "default"
              ) {
                const afterDefault = sourceCode.getTokenAfter(nextToken);
                return fixer.removeRange([
                  nextToken.range[0],
                  afterDefault.range[0],
                ]);
              }
            }
            return null;
          },
        });
      },
    };
  },
};

module.exports = rule;
