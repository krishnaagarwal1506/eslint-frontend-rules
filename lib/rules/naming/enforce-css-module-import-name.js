/**
 * @fileoverview Enforce a consistent local name for CSS Module imports
 * (`import styles from './x.module.css'`), so every file reads the same way.
 *
 * Only applies to the default/namespace import binding — not named imports
 * (some setups also export a member per class name; those aren't this
 * rule's concern, since there's no single "the module object" name to
 * standardize for them).
 *
 * Fixable: unlike a named import specifier (where the identifier IS the
 * external export name — see enforce-event-handler-naming's history),
 * a default/namespace import's *local* name is a free local alias. Renaming
 * it, and every reference to it, never changes what's actually imported.
 */
const micromatch = require("micromatch");

const MODULE_CSS_RE = /\.module\.(css|scss|sass|less)$/i;

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce a consistent local name for CSS Module default imports (default: 'styles').",
      category: "Best Practices",
    },
    fixable: "code",
    messages: {
      wrongName:
        'CSS Module import should be named "{{expected}}", not "{{actual}}".',
    },
    schema: [
      {
        type: "object",
        properties: {
          expectedName: { type: "string" },
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
    const expectedName = options.expectedName || "styles";
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};
    return {
      ImportDeclaration(node) {
        if (typeof node.source.value !== "string") return;
        if (!MODULE_CSS_RE.test(node.source.value)) return;
        const specifier = node.specifiers.find(
          (s) =>
            s.type === "ImportDefaultSpecifier" ||
            s.type === "ImportNamespaceSpecifier",
        );
        if (!specifier) return;
        const actualName = specifier.local.name;
        if (actualName === expectedName) return;
        context.report({
          node: specifier.local,
          messageId: "wrongName",
          data: { expected: expectedName, actual: actualName },
          fix(fixer) {
            const sourceCode = context.sourceCode;
            const scope = sourceCode.getScope(node);
            let variable = null;
            let currentScope = scope;
            while (currentScope) {
              variable = currentScope.variables.find(
                (v) => v.name === actualName,
              );
              if (variable) break;
              currentScope = currentScope.upper;
            }
            if (!variable) return null;
            const fixes = [fixer.replaceText(specifier.local, expectedName)];
            for (const ref of variable.references) {
              if (ref.identifier !== specifier.local) {
                fixes.push(fixer.replaceText(ref.identifier, expectedName));
              }
            }
            return fixes;
          },
        });
      },
    };
  },
};

module.exports = rule;
