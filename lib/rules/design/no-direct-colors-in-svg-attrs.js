/**
 * @fileoverview Disallow direct color values in SVG presentation attributes
 * (`fill`, `stroke`, `stopColor`) — the gap left by `no-direct-colors`, which
 * only checks `style`/`className`, not these SVG-specific JSX props.
 *
 * Keyword values (`none`, `currentColor`, `transparent`, `inherit`) are never
 * flagged — they aren't literal colors, they reference context.
 */
const micromatch = require("micromatch");
const { isDirectColor } = require("../../utils/colors");

const COLOR_ATTRS = ["fill", "stroke", "stopColor", "stop-color", "floodColor", "flood-color", "lightingColor", "lighting-color"];

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow direct color values in SVG presentation attributes (fill, stroke, stopColor). Use CSS variables or theme tokens.",
      category: "Best Practices",
    },
    messages: {
      noDirectColor:
        'Do not use a direct color value in "{{attr}}" (e.g., \'#fff\', \'red\', \'rgb(0,0,0)\'). Use a CSS variable or theme token instead.',
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
        if (!node.name || !COLOR_ATTRS.includes(node.name.name)) return;
        let value = null;
        if (node.value && node.value.type === "Literal") {
          value = node.value.value;
        } else if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "Literal"
        ) {
          value = node.value.expression.value;
        } else if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "TemplateLiteral" &&
          node.value.expression.expressions.length === 0
        ) {
          value = node.value.expression.quasis[0].value.cooked;
        }
        if (isDirectColor(value)) {
          context.report({
            node: node.value,
            messageId: "noDirectColor",
            data: { attr: node.name.name },
          });
        }
      },
    };
  },
};

module.exports = rule;
