/**
 * @fileoverview Disallow passing an async function directly as the callback
 * to useEffect/useLayoutEffect/useInsertionEffect.
 *
 * React calls the effect callback expecting either nothing or a synchronous
 * cleanup function back. An async function's return value is a Promise, not
 * a cleanup function — React silently ignores it, so any `return () => {...}`
 * cleanup written inside the async function is *never called*, and any
 * rejection is unhandled. The fix is always the same: define the async
 * logic as its own function and call it from a synchronous effect body.
 */
const micromatch = require("micromatch");

const EFFECT_HOOKS = new Set([
  "useEffect",
  "useLayoutEffect",
  "useInsertionEffect",
]);

function getEffectHookName(callee) {
  if (callee.type === "Identifier" && EFFECT_HOOKS.has(callee.name)) {
    return callee.name;
  }
  if (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    EFFECT_HOOKS.has(callee.property.name)
  ) {
    return callee.property.name;
  }
  return null;
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an async function as the direct callback to useEffect/useLayoutEffect/useInsertionEffect — React ignores its returned Promise and never runs its cleanup.",
      category: "Possible Errors",
    },
    messages: {
      noAsyncEffect:
        "The callback passed to {{hookName}} must not be async — React ignores the returned Promise, so any cleanup function inside it is never called. Define the async logic as a separate function and call it from a synchronous effect body.",
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
      CallExpression(node) {
        const hookName = getEffectHookName(node.callee);
        if (!hookName) return;
        const callback = node.arguments[0];
        if (!callback) return;
        if (
          (callback.type === "ArrowFunctionExpression" ||
            callback.type === "FunctionExpression") &&
          callback.async
        ) {
          context.report({
            node: callback,
            messageId: "noAsyncEffect",
            data: { hookName },
          });
        }
      },
    };
  },
};

module.exports = rule;
