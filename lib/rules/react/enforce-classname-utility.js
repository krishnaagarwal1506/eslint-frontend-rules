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
    // Was documented ("Allows these string literal values...") and accepted
    // via schema, but never actually consulted anywhere below — every
    // template literal was flagged regardless. A template literal with no
    // `${}` interpolation is just a static string; honor `allow` for those.
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
          const template = node.value.expression;
          if (template.expressions.length === 0) {
            const staticValue = template.quasis[0].value.cooked;
            if (allow.includes(staticValue)) return;
          }
          context.report({
            node: node.value,
            messageId: "useCn",
          });
        }
      },
    };
  },
};
