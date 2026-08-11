/**
 * @fileoverview Disallow object/array literal values passed directly to a
 * Context Provider's `value` prop.
 *
 * `<MyContext.Provider value={{ a, b }}>` creates a *new* object every
 * render, so every consumer of that context re-renders even if it's wrapped
 * in `memo` — the context value itself never compares equal across renders.
 * Same failure mode as `no-unstable-default-props`; the fix is the same too
 * (hoist a static value, or `useMemo` a computed one).
 */
const micromatch = require("micromatch");

function isUnstableLiteral(node) {
  return node.type === "ObjectExpression" || node.type === "ArrayExpression";
}

function isProviderElementName(name) {
  return (
    name.type === "JSXMemberExpression" &&
    name.property.type === "JSXIdentifier" &&
    name.property.name === "Provider"
  );
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow object/array literal values on a Context Provider's `value` prop — a new reference is created every render, forcing every consumer to re-render.",
      category: "Best Practices",
    },
    messages: {
      unstableContextValue:
        "Context Provider `value` is an object/array literal — a new reference is created on every render, so every consumer re-renders regardless of memoization. Hoist a static value to a module-level constant, or wrap a computed one in useMemo().",
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
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};

    return {
      JSXOpeningElement(node) {
        if (!isProviderElementName(node.name)) return;
        const valueAttr = node.attributes.find(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "value",
        );
        if (!valueAttr || !valueAttr.value) return;
        if (valueAttr.value.type !== "JSXExpressionContainer") return;
        const expr = valueAttr.value.expression;
        if (isUnstableLiteral(expr)) {
          context.report({ node: expr, messageId: "unstableContextValue" });
        }
      },
    };
  },
};

module.exports = rule;
