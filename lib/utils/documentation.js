function hasJSDoc(node, sourceCode) {
  const jsdoc = sourceCode
    .getCommentsBefore(node)
    .find(
      (comment) => comment.type === "Block" && comment.value.startsWith("*")
    );
  return Boolean(jsdoc);
}

function isRootLevel(node) {
  return node.parent && node.parent.type === "Program";
}

/**
 * Factory to create a JSDoc rule for a specific function type.
 * @param {Object} options
 * @param {(name: string) => boolean} typePredicate - Returns true if the function matches the type (component/hook/root).
 * @param {string} messageId - The messageId for reporting.
 * @param {string} defaultMessage - The default error message.
 * @returns {import('eslint').Rule.RuleModule}
 */
function createJsdocRule({ typePredicate, messageId, defaultMessage }) {
  const micromatch = require("micromatch");
  return {
    meta: {
      type: "suggestion",
      docs: {
        description: defaultMessage,
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
        [messageId]: defaultMessage,
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
      function check(node) {
        if (!isRootLevel(node)) return;
        const name = node.id ? node.id.name : null;
        if (!typePredicate(name)) return;
        if (hasJSDoc(node, sourceCode)) return;
        context.report({
          node,
          messageId,
          data: { name: name || "(anonymous)" },
        });
      }
      return {
        FunctionDeclaration: check,
        VariableDeclaration(node) {
          if (!isRootLevel(node)) return;
          for (const decl of node.declarations) {
            const name = decl.id && decl.id.name;
            if (
              decl.init &&
              (decl.init.type === "ArrowFunctionExpression" ||
                decl.init.type === "FunctionExpression") &&
              typePredicate(name) &&
              !hasJSDoc(node, sourceCode)
            ) {
              context.report({
                node: decl,
                messageId,
                data: { name: name || "(anonymous)" },
              });
            }
          }
        },
      };
    },
  };
}

module.exports = { hasJSDoc, isRootLevel, createJsdocRule };
