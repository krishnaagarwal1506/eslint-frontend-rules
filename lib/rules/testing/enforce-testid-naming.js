/**
 * @fileoverview Enforce consistent test ID attribute naming.
 * Ensures that data-testid attributes use kebab-case and follow a naming convention.
 */
const micromatch = require("micromatch");

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce that data-testid attributes in JSX use consistent kebab-case naming.",
      category: "Best Practices",
    },
    fixable: "code",
    messages: {
      invalidTestId:
        'data-testid "{{value}}" should be in kebab-case (e.g., "my-component-button").',
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: { type: "string" },
          },
          testIdAttribute: {
            type: "string",
            description: "The attribute name to check (default: data-testid).",
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
    const testIdAttribute = options.testIdAttribute || "data-testid";
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};

    function toKebabCase(str) {
      return str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/[_\s]+/g, "-")
        .toLowerCase();
    }

    return {
      JSXAttribute(node) {
        if (!node.name || node.name.name !== testIdAttribute) return;
        if (!node.value) return;
        let value = null;
        if (
          node.value.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          value = node.value.value;
        } else if (
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "Literal" &&
          typeof node.value.expression.value === "string"
        ) {
          value = node.value.expression.value;
        }
        if (!value) return;
        if (!KEBAB_CASE_REGEX.test(value)) {
          context.report({
            node: node.value,
            messageId: "invalidTestId",
            data: { value },
            fix(fixer) {
              const fixed = toKebabCase(value);
              if (node.value.type === "Literal") {
                return fixer.replaceText(node.value, `"${fixed}"`);
              }
              return fixer.replaceText(node.value, `{"${fixed}"}`);
            },
          });
        }
      },
    };
  },
};
