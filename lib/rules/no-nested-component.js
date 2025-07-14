/**
 * @fileoverview Disallow defining a new component inside another component.
 *
 * This rule prevents declaring a React component (function or class) inside the body of another component. All components should be defined at the top level of the file for performance and maintainability.
 *
 * Why?
 * - Inner components are recreated on every render, breaking memoization and harming performance.
 * - Encourages clear, maintainable code structure.
 *
 * Configuration:
 * - `ignore`: Array of glob patterns to ignore files.
 */

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow defining a new component inside another component.",
      category: "Best Practices",
    },
    messages: {
      noNestedComponent:
        "Do not define a new component inside another component. Move '{{name}}' to the top level of the file.",
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
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    let micromatch;
    if (ignorePatterns.length) {
      micromatch = require("micromatch");
      const filename = context.getFilename();
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    // Helper: is a function/class a React component?
    function isComponent(node) {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        // Heuristic: name starts with uppercase, or returns JSX
        if (node.id && /^[A-Z]/.test(node.id.name)) return true;
        if (
          node.parent &&
          node.parent.type === "VariableDeclarator" &&
          /^[A-Z]/.test(node.parent.id.name)
        )
          return true;
        // Returns JSX (JSXElement or JSXFragment)
        if (node.body && node.body.type === "BlockStatement") {
          return node.body.body.some(
            (stmt) =>
              stmt.type === "ReturnStatement" &&
              stmt.argument &&
              (stmt.argument.type === "JSXElement" ||
                stmt.argument.type === "JSXFragment")
          );
        }
      }
      if (
        node.type === "ClassDeclaration" &&
        node.id &&
        /^[A-Z]/.test(node.id.name)
      ) {
        return true;
      }
      return false;
    }
    // Track component nesting
    let componentStack = [];
    return {
      FunctionDeclaration(node) {
        if (isComponent(node)) {
          if (componentStack.length > 0) {
            context.report({
              node,
              messageId: "noNestedComponent",
              data: { name: node.id ? node.id.name : "(anonymous)" },
            });
          }
          componentStack.push(node);
        }
      },
      "FunctionDeclaration:exit"(node) {
        if (isComponent(node)) {
          componentStack.pop();
        }
      },
      ClassDeclaration(node) {
        if (isComponent(node)) {
          if (componentStack.length > 0) {
            context.report({
              node,
              messageId: "noNestedComponent",
              data: { name: node.id ? node.id.name : "(anonymous)" },
            });
          }
          componentStack.push(node);
        }
      },
      "ClassDeclaration:exit"(node) {
        if (isComponent(node)) {
          componentStack.pop();
        }
      },
      // For arrow functions assigned to variables
      VariableDeclarator(node) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression") &&
          /^[A-Z]/.test(node.id.name)
        ) {
          if (componentStack.length > 0) {
            context.report({
              node,
              messageId: "noNestedComponent",
              data: { name: node.id.name },
            });
          }
          componentStack.push(node);
        }
      },
      "VariableDeclarator:exit"(node) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression") &&
          /^[A-Z]/.test(node.id.name)
        ) {
          componentStack.pop();
        }
      },
    };
  },
};

module.exports = rule;
