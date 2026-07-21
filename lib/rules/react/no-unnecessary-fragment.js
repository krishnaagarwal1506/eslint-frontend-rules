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

    // Replacing `<>{child}</>` with bare `child` text is only valid when the
    // fragment itself sits in a JSX-children position (a literal child of a
    // surrounding element/fragment). If the fragment is instead the operand of
    // a plain JS expression — e.g. `{cond && <>...</>}`, a ternary branch, a
    // return value, an arrow function's implicit return — swapping in bare
    // `{...}`-shaped JSX there produces invalid syntax (this broke a real
    // codebase: `{ordering && (<>...</>)}` became a bare object/block literal
    // and failed to parse). Only autofix the provably-safe case; still report
    // (without a fix) everywhere else so the diagnostic stays useful.
    function isInJsxChildrenPosition(node) {
      return (
        !!node.parent &&
        (node.parent.type === "JSXElement" || node.parent.type === "JSXFragment")
      );
    }

    function fixFragment(fixer, node, children) {
      const child = children[0];
      const childText = sourceCode.getText(child);
      return fixer.replaceText(node, childText);
    }

    return {
      JSXFragment(node) {
        const children = getMeaningfulChildren(node.children);
        if (children.length === 1 && children[0].type !== "JSXFragment") {
          const safeToFix = isInJsxChildrenPosition(node);
          context.report({
            node,
            messageId: "unnecessaryFragment",
            fix: safeToFix
              ? (fixer) => fixFragment(fixer, node, children)
              : undefined,
          });
        }
      },
      JSXElement(node) {
        if (isFragmentElement(node)) {
          const children = getMeaningfulChildren(node.children);
          if (children.length === 1 && children[0].type !== "JSXFragment") {
            const safeToFix = isInJsxChildrenPosition(node);
            context.report({
              node,
              messageId: "unnecessaryFragment",
              fix: safeToFix
                ? (fixer) => fixFragment(fixer, node, children)
                : undefined,
            });
          }
        }
      },
    };
  },
};

module.exports = rule;
