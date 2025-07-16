/**
 * @fileoverview Warns if React fragments (<>...</> or <React.Fragment>...</React.Fragment>) are unnecessary.
 *
 * This rule checks for unnecessary fragments in JSX. If a fragment wraps a single child or is not needed for grouping, it warns the user.
 *
 * Why? Unnecessary fragments add noise to the code and can be safely removed for clarity.
 */

const {
  getMeaningfulChildren,
  isFragmentElement,
} = require("../../utils/fragment-helpers");

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn if React fragments are unnecessary (e.g., wrapping a single child).",
      category: "Best Practices",
    },
    messages: {
      unnecessaryFragment:
        "Unnecessary React fragment: consider removing the fragment wrapper.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXFragment(node) {
        const children = getMeaningfulChildren(node.children);
        if (children.length === 1 && children[0].type !== "JSXFragment") {
          context.report({
            node,
            messageId: "unnecessaryFragment",
          });
        }
      },
      JSXElement(node) {
        if (isFragmentElement(node)) {
          const children = getMeaningfulChildren(node.children);
          if (children.length === 1 && children[0].type !== "JSXFragment") {
            context.report({
              node,
              messageId: "unnecessaryFragment",
            });
          }
        }
      },
    };
  },
};

module.exports = rule;
