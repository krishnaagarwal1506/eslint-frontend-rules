/**
 * @fileoverview Warns if className prop in JSX is set to a template string (e.g., className={`foo ${bar}`}) instead of using a function/library like cn.
 * Example: <Component className={`foo ${bar}`} /> (should use cn or a similar utility)
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Encourage use of a function/library (e.g., cn) for className instead of string literals.",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
            description:
              "Allow these string literal values for className (e.g., empty string)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useCn:
        "Use a function or library (e.g., cn) to handle className instead of a string literal.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const allow = options.allow || [""];
    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === "className" &&
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "TemplateLiteral"
        ) {
          context.report({
            node: node.value,
            messageId: "useCn",
          });
        }
      },
    };
  },
};
