/**
 * @fileoverview Warns if JSX props use unnecessary curly braces for string literals.
 * Example: <Component name={'xyz'} /> (should be <Component name="xyz" />)
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow unnecessary curly braces for string literal props in JSX.",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unnecessaryCurly:
        "Unnecessary curly braces for string literal prop '{{prop}}'. Use plain string instead.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "Literal" &&
          typeof node.value.expression.value === "string"
        ) {
          context.report({
            node: node.value,
            messageId: "unnecessaryCurly",
            data: { prop: node.name.name },
            fix(fixer) {
              // Replace {'xyz'} with "xyz"
              const raw =
                node.value.expression.raw ||
                JSON.stringify(node.value.expression.value);
              return fixer.replaceText(node.value, raw);
            },
          });
        }
      },
    };
  },
};
