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
} = require("../../utils/react");

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn if React fragments are unnecessary (e.g., wrapping a single child).",
      category: "Best Practices",
    },
    fixable: "code",
    messages: {
      unnecessaryFragment:
        "Unnecessary React fragment: consider removing the fragment wrapper.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function fixFragment(fixer, node, children) {
      const child = children[0];
      const childText = sourceCode.getText(child);
      return fixer.replaceText(node, childText);
    }

    return {
      JSXFragment(node) {
        const children = getMeaningfulChildren(node.children);
        if (children.length === 1 && children[0].type !== "JSXFragment") {
          context.report({
            node,
            messageId: "unnecessaryFragment",
            fix(fixer) {
              return fixFragment(fixer, node, children);
            },
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
              fix(fixer) {
                return fixFragment(fixer, node, children);
              },
            });
          }
        }
      },
    };
  },
};

module.exports = rule;
