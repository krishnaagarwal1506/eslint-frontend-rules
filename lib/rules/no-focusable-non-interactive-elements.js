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
    const filename = context.getFilename();
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
            attr.name.name === "onClick"
        );
        if (!hasOnClick) return;
        const hasRoleButton = node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "role" &&
            attr.value &&
            attr.value.type === "Literal" &&
            attr.value.value === "button"
        );
        const hasOnKeyDown = node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name &&
            attr.name.name === "onKeyDown"
        );
        console.log(
          `Checking <${tag}>: hasOnClick=${hasOnClick}, hasRoleButton=${hasRoleButton}, hasOnKeyDown=${hasOnKeyDown}`
        );
        if (!hasRoleButton && !hasOnKeyDown) {
          context.report({
            node,
            messageId: "nonInteractive",
            data: { tag },
          });
        }
      },
    };
  },
};

module.exports = rule;
