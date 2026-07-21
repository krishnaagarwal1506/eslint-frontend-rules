/**
 * @fileoverview Require an accessible name on icon-only `<button>` elements.
 *
 * A button whose only content is an icon (e.g. an SVG, or a component like
 * `<X />`/`<Trash2 />`) has no accessible name for screen reader users unless
 * one is supplied via `aria-label`, `aria-labelledby`, or `title`. Buttons
 * with any real text content are left alone — the visible text already
 * serves as the accessible name.
 */
const micromatch = require("micromatch");
const { getMeaningfulChildren } = require("../../utils/react");

const NAME_ATTRS = ["aria-label", "aria-labelledby", "title"];

function hasAccessibleNameAttr(attributes) {
  return attributes.some(
    (attr) =>
      attr.type === "JSXAttribute" &&
      attr.name &&
      NAME_ATTRS.includes(attr.name.name),
  );
}

function hasVisibleText(children) {
  return children.some((child) => {
    if (child.type === "JSXText") return child.value.trim() !== "";
    if (
      child.type === "JSXExpressionContainer" &&
      child.expression.type === "Literal" &&
      typeof child.expression.value === "string" &&
      child.expression.value.trim() !== ""
    )
      return true;
    // A dynamic expression (`{label}`, `{count}`) might render text — can't
    // know statically, so treat it as "might have visible text" and skip.
    if (
      child.type === "JSXExpressionContainer" &&
      child.expression.type !== "JSXEmptyExpression"
    )
      return true;
    return false;
  });
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require an accessible name (aria-label, aria-labelledby, or title) on icon-only <button> elements.",
      category: "Accessibility",
    },
    messages: {
      missingAccessibleName:
        "Icon-only <button> has no accessible name. Add aria-label, aria-labelledby, or title.",
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
      JSXElement(node) {
        const opening = node.openingElement;
        if (
          !opening.name ||
          opening.name.type !== "JSXIdentifier" ||
          opening.name.name !== "button"
        )
          return;
        if (hasAccessibleNameAttr(opening.attributes)) return;
        const hasSpread = opening.attributes.some(
          (attr) => attr.type === "JSXSpreadAttribute",
        );
        if (hasSpread) return;
        const children = getMeaningfulChildren(node.children);
        // No children at all, or definitely-visible text — not this rule's concern.
        if (children.length === 0) return;
        if (hasVisibleText(children)) return;
        context.report({ node: opening, messageId: "missingAccessibleName" });
      },
    };
  },
};

module.exports = rule;
