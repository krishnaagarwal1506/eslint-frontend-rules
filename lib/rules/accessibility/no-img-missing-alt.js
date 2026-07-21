/**
 * @fileoverview Require an `alt` attribute on raw `<img>` elements.
 *
 * `alt=""` (explicitly empty) is valid and intentional for decorative images —
 * this rule only flags a *missing* attribute, never an empty one, so it never
 * pressures anyone into writing meaningless alt text. Images marked
 * `aria-hidden="true"` are already hidden from assistive tech and are skipped.
 */
const micromatch = require("micromatch");

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Require an "alt" attribute on raw <img> elements (accessibility).',
      category: "Accessibility",
    },
    messages: {
      missingAlt:
        '<img> is missing an "alt" attribute. Use alt="" for purely decorative images, or describe the image for screen reader users.',
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
        if (!node.name || node.name.type !== "JSXIdentifier" || node.name.name !== "img")
          return;
        const hasAlt = node.attributes.some(
          (attr) => attr.type === "JSXAttribute" && attr.name && attr.name.name === "alt",
        );
        if (hasAlt) return;
        const ariaHidden = node.attributes.find(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "aria-hidden",
        );
        if (
          ariaHidden &&
          ((ariaHidden.value && ariaHidden.value.type === "Literal" && ariaHidden.value.value === "true") ||
            (ariaHidden.value &&
              ariaHidden.value.type === "JSXExpressionContainer" &&
              ariaHidden.value.expression.type === "Literal" &&
              ariaHidden.value.expression.value === true))
        ) {
          return;
        }
        // A spread prop (`<img {...imgProps} />`) may already carry `alt` —
        // can't know statically, so don't flag it.
        const hasSpread = node.attributes.some((attr) => attr.type === "JSXSpreadAttribute");
        if (hasSpread) return;
        context.report({ node, messageId: "missingAlt" });
      },
    };
  },
};

module.exports = rule;
