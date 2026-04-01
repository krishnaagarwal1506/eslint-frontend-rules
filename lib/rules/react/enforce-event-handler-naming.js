/**
 * @fileoverview Enforce event handler naming conventions in React components.
 * Props callbacks should use "on" prefix, internal handlers should use "handle" prefix.
 */
const micromatch = require("micromatch");

const EVENT_PROP_REGEX = /^on[A-Z]/;
const HANDLER_REGEX = /^handle[A-Z]/;

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        'Enforce event handler naming: "on*" for props, "handle*" for internal handlers.',
      category: "Best Practices",
    },
    messages: {
      handlerPropNaming:
        'Event handler prop "{{name}}" should start with "on" (e.g., "on{{expected}}").',
      handlerFuncNaming:
        'Event handler function "{{name}}" passed to "{{prop}}" should start with "handle" (e.g., "handle{{expected}}").',
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
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};
    return {
      JSXAttribute(node) {
        if (!node.name || !node.name.name) return;
        const propName = node.name.name;
        // Only check on* props that look like event handlers
        if (!EVENT_PROP_REGEX.test(propName)) return;
        // Check if the value is an identifier (handler reference)
        if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression &&
          node.value.expression.type === "Identifier"
        ) {
          const handlerName = node.value.expression.name;
          // Handler passed to on* prop should start with "handle"
          if (
            !HANDLER_REGEX.test(handlerName) &&
            !EVENT_PROP_REGEX.test(handlerName)
          ) {
            const eventPart = propName.slice(2); // Remove "on"
            context.report({
              node: node.value.expression,
              messageId: "handlerFuncNaming",
              data: {
                name: handlerName,
                prop: propName,
                expected: eventPart,
              },
              fix(fixer) {
                const newName = "handle" + eventPart;
                const sourceCode = context.sourceCode;
                const scope = sourceCode.getScope(node);
                let variable = null;
                let currentScope = scope;
                while (currentScope) {
                  variable = currentScope.variables.find(
                    (v) => v.name === handlerName,
                  );
                  if (variable) break;
                  currentScope = currentScope.upper;
                }
                if (!variable)
                  return fixer.replaceText(node.value.expression, newName);
                const fixes = [];
                for (const ref of variable.references) {
                  fixes.push(fixer.replaceText(ref.identifier, newName));
                }
                // Also rename definition
                for (const def of variable.defs) {
                  if (def.name && def.name !== node.value.expression) {
                    fixes.push(fixer.replaceText(def.name, newName));
                  }
                }
                return fixes;
              },
            });
          }
        }
      },
    };
  },
};
