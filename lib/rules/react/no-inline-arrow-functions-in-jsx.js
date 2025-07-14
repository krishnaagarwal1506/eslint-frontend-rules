// ESLint rule: Disallow inline arrow functions in JSX props (e.g., onClick={() => ...}) to prevent unnecessary re-renders.

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow inline arrow functions in JSX props (e.g., onClick={() => ...}) for better performance.",
      category: "Best Practices",
    },
    messages: {
      noInlineArrow:
        "Avoid inline arrow functions in JSX props (e.g., onClick). Define the function outside the render method for better performance.",
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
      JSXAttribute(node) {
        if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression &&
          node.value.expression.type === "ArrowFunctionExpression"
        ) {
          context.report({
            node: node.value,
            messageId: "noInlineArrow",
          });
        }
      },
    };
  },
};

module.exports = rule;
