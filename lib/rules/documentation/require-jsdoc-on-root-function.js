/**
 * @fileoverview Warns if a root-level function lacks a JSDoc comment.
 * Supports folder restriction via options.
 */

const micromatch = require("micromatch");
const { hasJSDoc, isRootLevel } = require("../../utils/documentation");
const { isComponentName, isHookName } = require("../../utils/react");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require JSDoc comment for root-level functions",
      category: "Documentation",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          folders: {
            type: "array",
            items: { type: "string" },
            description:
              "Only apply rule to files in these folders (micromatch patterns)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingJSDoc:
        'Root-level function "{{name}}" should have a JSDoc comment.',
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const folders = options.folders || null;
    const filename = context.getFilename();
    if (
      folders &&
      !folders.some((pattern) => micromatch.isMatch(filename, pattern))
    ) {
      return {};
    }
    const sourceCode = context.getSourceCode();

    function checkFunction(node) {
      if (!isRootLevel(node)) return;
      const name = node.id ? node.id.name : null;
      if (isComponentName(name) || isHookName(name)) return; // skip components and hooks
      if (hasJSDoc(node, sourceCode)) return;
      context.report({
        node,
        messageId: "missingJSDoc",
        data: { name: name || "(anonymous)" },
      });
    }
    return {
      FunctionDeclaration: checkFunction,
      VariableDeclaration(node) {
        if (!isRootLevel(node)) return;
        for (const decl of node.declarations) {
          const name = decl.id && decl.id.name;
          if (
            decl.init &&
            (decl.init.type === "ArrowFunctionExpression" ||
              decl.init.type === "FunctionExpression")
          ) {
            if (isComponentName(name) || isHookName(name)) continue; // skip components and hooks
            if (!hasJSDoc(node, sourceCode)) {
              context.report({
                node: decl,
                messageId: "missingJSDoc",
                data: { name: name || "(anonymous)" },
              });
            }
          }
        }
      },
    };
  },
};
