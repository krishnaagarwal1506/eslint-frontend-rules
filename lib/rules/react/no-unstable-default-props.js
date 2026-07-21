/**
 * @fileoverview Disallow object/array/function literal default values in a
 * component or hook's destructured parameters.
 *
 * `function Card({ items = [] }) {}` creates a *new* array every call — if
 * `items` is ever passed to a memoized child, an effect dependency array, or
 * compared by reference, that comparison silently fails every time,
 * defeating the memoization. Scoped to components/hooks (by name) rather
 * than every function, since that's where this specific failure mode
 * (props/deps compared by reference) actually applies.
 */
const micromatch = require("micromatch");
const { isComponentName, isHookName } = require("../../utils/react");

function isUnstableLiteral(node) {
  return (
    node.type === "ObjectExpression" ||
    node.type === "ArrayExpression" ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression"
  );
}

function checkParams(context, params) {
  for (const param of params) {
    // `function useThing({ a = 1 } = {})` — the whole destructured
    // parameter can *itself* have a default (here, `{}`), separate from
    // any defaults on its individual properties. Check it, then unwrap to
    // reach the underlying ObjectPattern.
    let pattern = param;
    if (pattern.type === "AssignmentPattern") {
      if (isUnstableLiteral(pattern.right)) {
        context.report({
          node: pattern.right,
          messageId: "unstableDefault",
          data: { name: "(destructured parameter)" },
        });
      }
      pattern = pattern.left;
    }
    if (pattern.type !== "ObjectPattern") continue;
    for (const prop of pattern.properties) {
      if (prop.type !== "Property") continue;
      if (prop.value.type !== "AssignmentPattern") continue;
      if (isUnstableLiteral(prop.value.right)) {
        const name = prop.key && prop.key.name ? prop.key.name : "(prop)";
        context.report({
          node: prop.value.right,
          messageId: "unstableDefault",
          data: { name },
        });
      }
    }
  }
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow object/array/function literal default values in a component or hook's destructured parameters — a new reference is created every call.",
      category: "Best Practices",
    },
    messages: {
      unstableDefault:
        'Default value for "{{name}}" is an object/array/function literal — a new reference is created on every call, breaking memoization and reference comparisons. Hoist it to a module-level constant instead.',
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

    function isComponentOrHook(name) {
      return !!name && (isComponentName(name) || isHookName(name));
    }

    return {
      FunctionDeclaration(node) {
        if (!isComponentOrHook(node.id && node.id.name)) return;
        checkParams(context, node.params);
      },
      VariableDeclarator(node) {
        if (
          !node.init ||
          (node.init.type !== "ArrowFunctionExpression" &&
            node.init.type !== "FunctionExpression")
        )
          return;
        if (!node.id || node.id.type !== "Identifier") return;
        if (!isComponentOrHook(node.id.name)) return;
        checkParams(context, node.init.params);
      },
    };
  },
};

module.exports = rule;
