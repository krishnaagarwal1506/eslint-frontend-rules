/**
 * @fileoverview
 * Flags elements that have onClick handlers but are not inherently interactive (e.g., <div> with onClick).
 * Suggests adding role="button" or converting to <button>, and adding onKeyDown for accessibility.
 */
const INTERACTIVE_ELEMENTS = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "option",
  "details",
  "summary",
  "label",
  "iframe",
  "audio",
  "video",
  "area",
  "menuitem",
  "option",
  "progress",
  "meter",
];

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        'Flag non-interactive elements with onClick. Suggest role="button" or using <button>, and onKeyDown for accessibility.',
      category: "Accessibility",
    },
    messages: {
      nonInteractive:
        'Non-interactive element <{{tag}}> with onClick detected. Consider using <button> or adding role="button" and onKeyDown for accessibility.',
    },
    fixable: "code",
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
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    return {
      JSXOpeningElement(node) {
        const tag = node.name && node.name.name;
        // Skip custom components (tag starts with uppercase letter)
        if (!tag || typeof tag !== "string") return;
        if (tag[0] === tag[0].toUpperCase()) return;
        if (INTERACTIVE_ELEMENTS.includes(tag)) return;
        const hasOnClick = node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "onClick",
        );
        if (!hasOnClick) return;
        // Any existing `role` (not just role="button") means the author already
        // made an explicit accessibility choice — don't insert a second, possibly
        // conflicting `role` attribute (JSX disallows duplicate prop names).
        const hasAnyRole = node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" && attr.name && attr.name.name === "role",
        );
        const hasTabIndex = node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "tabIndex",
        );
        const hasOnKeyDown = node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "onKeyDown",
        );
        if (!hasAnyRole && !hasOnKeyDown) {
          context.report({
            node,
            messageId: "nonInteractive",
            data: { tag },
            fix(fixer) {
              const fixes = [];
              const lastAttr = node.attributes[node.attributes.length - 1];
              const insertPos = lastAttr
                ? lastAttr.range[1]
                : node.name.range[1];
              let attrsToInsert = "";
              if (!hasAnyRole) attrsToInsert += ' role="button"';
              if (!hasTabIndex) attrsToInsert += " tabIndex={0}";

              // Add an onKeyDown handler that triggers the same behavior as
              // onClick on Enter/Space. We wrap the *original expression* — not
              // a string-sliced guess at its shape — in parens and call it, so
              // this works whether onClick is an identifier, a call, or an
              // inline arrow function: `(EXPR)(e)`.
              const onClickAttr = node.attributes.find(
                (attr) =>
                  attr.type === "JSXAttribute" &&
                  attr.name &&
                  attr.name.name === "onClick",
              );
              if (
                onClickAttr &&
                onClickAttr.value &&
                onClickAttr.value.type === "JSXExpressionContainer" &&
                onClickAttr.value.expression &&
                onClickAttr.value.expression.type !== "JSXEmptyExpression"
              ) {
                const sourceCode = context.sourceCode;
                const onClickExpr = sourceCode.getText(
                  onClickAttr.value.expression,
                );
                attrsToInsert += ` onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") (${onClickExpr})(e); }}`;
              }
              if (!attrsToInsert) return [];
              fixes.push(
                fixer.insertTextAfterRange([insertPos, insertPos], attrsToInsert),
              );
              return fixes;
            },
          });
        }
      },
    };
  },
};

module.exports = rule;
