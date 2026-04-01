/**
 * @fileoverview Enforce that useState destructuring follows [value, setValue] convention.
 * The setter should be the camelCase name prefixed with "set".
 */
const micromatch = require("micromatch");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce useState destructuring follows [value, setValue] naming convention.",
      category: "Best Practices",
    },
    messages: {
      useStateNaming:
        'useState setter "{{setter}}" should be named "set{{expected}}" to match state variable "{{state}}".',
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
      VariableDeclarator(node) {
        // Match: const [x, setX] = useState(...)
        if (
          !node.init ||
          node.init.type !== "CallExpression" ||
          !node.id ||
          node.id.type !== "ArrayPattern"
        )
          return;
        const callee = node.init.callee;
        // Check if it's a useState call (useState or React.useState)
        const isUseState =
          (callee.type === "Identifier" && callee.name === "useState") ||
          (callee.type === "MemberExpression" &&
            callee.object.name === "React" &&
            callee.property.name === "useState");
        if (!isUseState) return;
        const elements = node.id.elements;
        if (!elements || elements.length !== 2) return;
        const [stateNode, setterNode] = elements;
        if (
          !stateNode ||
          !setterNode ||
          stateNode.type !== "Identifier" ||
          setterNode.type !== "Identifier"
        )
          return;
        const stateName = stateNode.name;
        const setterName = setterNode.name;
        const expectedSetter =
          "set" + stateName.charAt(0).toUpperCase() + stateName.slice(1);
        if (setterName !== expectedSetter) {
          context.report({
            node: setterNode,
            messageId: "useStateNaming",
            data: {
              setter: setterName,
              expected: stateName.charAt(0).toUpperCase() + stateName.slice(1),
              state: stateName,
            },
            fix(fixer) {
              const sourceCode = context.sourceCode;
              const scope = sourceCode.getScope(node);
              // Find all references to the setter in the current scope
              let variable = null;
              let currentScope = scope;
              while (currentScope) {
                variable = currentScope.variables.find(
                  (v) => v.name === setterName,
                );
                if (variable) break;
                currentScope = currentScope.upper;
              }
              if (!variable) return null;
              const fixes = [];
              // Rename the declaration
              fixes.push(fixer.replaceText(setterNode, expectedSetter));
              // Rename all references
              for (const ref of variable.references) {
                if (ref.identifier !== setterNode) {
                  fixes.push(fixer.replaceText(ref.identifier, expectedSetter));
                }
              }
              return fixes;
            },
          });
        }
      },
    };
  },
};
