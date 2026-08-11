/**
 * @fileoverview Disallow a fully-static object literal on JSX `style` —
 * hoist it to a module-level constant instead.
 *
 * `style={{ color: "red" }}` is React's only syntax for inline styles, so
 * flagging every `style={{...}}` would just be noise — most of them read a
 * prop, state, or theme value and genuinely need to be built per render.
 * This rule only flags the subset where every value is a literal (no
 * identifiers, member/call expressions, or interpolation): those have zero
 * reason to be recreated on every render, so hoisting is a strict
 * improvement with no useMemo/dependency-array tradeoff to weigh.
 */
const micromatch = require("micromatch");

function isStaticExpression(node) {
  if (!node) return false;
  switch (node.type) {
    case "Literal":
      return true;
    case "UnaryExpression":
      return (
        (node.operator === "-" || node.operator === "+") &&
        isStaticExpression(node.argument)
      );
    case "TemplateLiteral":
      return node.expressions.length === 0;
    case "ObjectExpression":
      return node.properties.every(
        (prop) =>
          prop.type === "Property" &&
          !prop.computed &&
          isStaticExpression(prop.value),
      );
    case "ArrayExpression":
      return node.elements.every(
        (el) => el !== null && isStaticExpression(el),
      );
    default:
      return false;
  }
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow a fully-static object literal on JSX `style` — hoist it to a module-level constant so a new object isn't created on every render.",
      category: "Best Practices",
    },
    messages: {
      staticInlineStyle:
        "This style object is static (no dynamic values) — hoist it to a module-level constant instead of creating a new object every render.",
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
      JSXAttribute(node) {
        if (!node.name || node.name.name !== "style") return;
        if (!node.value || node.value.type !== "JSXExpressionContainer")
          return;
        const expr = node.value.expression;
        if (expr.type !== "ObjectExpression") return;
        if (isStaticExpression(expr)) {
          context.report({ node: expr, messageId: "staticInlineStyle" });
        }
      },
    };
  },
};

module.exports = rule;
