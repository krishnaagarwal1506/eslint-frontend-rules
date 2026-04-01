// ESLint rule to enforce that all top-level (file-scope) const variable names are in ALL_CAPS (snake case).
// Only applies to const declarations that are not inside any function, class, or object.

function isAllCapsSnake(name) {
  // Snake case: ALL_CAPS, digits and underscores only, at least one letter
  return /^[A-Z][A-Z0-9_]*$/.test(name);
}

function toUpperSnake(name) {
  // Convert camelCase/PascalCase to UPPER_SNAKE_CASE
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
}

const topLevelConstSnakeCase = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require top-level consts to be ALL_CAPS (snake case)",
      category: "Best Practices",
    },
    fixable: "code",
    messages: {
      topLevelConstCaps:
        'Top-level const "{{name}}" should be ALL_CAPS (snake case).',
    },
    schema: [],
  },
  create(context) {
    // Only run this rule for .tsx files
    const filename = context.filename;
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    if (!filename.endsWith(".tsx")) {
      return {};
    }
    // Support ignore option (array of glob patterns)
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) {
        return {};
      }
    }
    return {
      Program(node) {
        for (const stmt of node.body) {
          if (stmt.type === "VariableDeclaration" && stmt.kind === "const") {
            for (const decl of stmt.declarations) {
              // Ignore if the const is a function (arrow or function expression)
              if (
                decl.init &&
                (decl.init.type === "ArrowFunctionExpression" ||
                  decl.init.type === "FunctionExpression")
              ) {
                continue;
              }
              if (
                decl.id &&
                decl.id.type === "Identifier" &&
                !isAllCapsSnake(decl.id.name)
              ) {
                context.report({
                  node: decl.id,
                  messageId: "topLevelConstCaps",
                  data: { name: decl.id.name },
                  fix(fixer) {
                    const newName = toUpperSnake(decl.id.name);
                    const sourceCode = context.sourceCode;
                    const scope = sourceCode.getScope(node);
                    let variable = null;
                    let currentScope = scope;
                    while (currentScope) {
                      variable = currentScope.variables.find(
                        (v) => v.name === decl.id.name,
                      );
                      if (variable) break;
                      currentScope = currentScope.upper;
                    }
                    if (!variable) return fixer.replaceText(decl.id, newName);
                    const fixes = [fixer.replaceText(decl.id, newName)];
                    for (const ref of variable.references) {
                      if (ref.identifier !== decl.id) {
                        fixes.push(fixer.replaceText(ref.identifier, newName));
                      }
                    }
                    return fixes;
                  },
                });
              }
            }
          }
        }
      },
    };
  },
};

module.exports = topLevelConstSnakeCase;
