/**
 * @fileoverview Require a file's name to match the component it exports
 * (e.g. `button.tsx` should export `Button`).
 *
 * Ties together `enforce-kebab-case-filenames` (format of the name) and the
 * component-naming rules (format of the export) — nothing currently checks
 * that the two actually agree, so a file can drift (e.g. after a rename)
 * without any rule catching it.
 */
const micromatch = require("micromatch");
const { isComponentName } = require("../../utils/react");

function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function normalize(name) {
  return name.replace(/[-_]/g, "").toLowerCase();
}

function isComponentInit(init) {
  if (!init) return false;
  return (
    init.type === "ArrowFunctionExpression" ||
    init.type === "FunctionExpression" ||
    init.type === "CallExpression" ||
    init.type === "TaggedTemplateExpression"
  );
}

function collectFromDeclaration(declNode, isDefault, candidates) {
  if (!declNode) return;
  if (
    (declNode.type === "FunctionDeclaration" ||
      declNode.type === "ClassDeclaration") &&
    declNode.id &&
    isComponentName(declNode.id.name)
  ) {
    candidates.push({ name: declNode.id.name, node: declNode.id, isDefault });
    return;
  }
  if (declNode.type === "VariableDeclaration") {
    for (const d of declNode.declarations) {
      if (
        d.id &&
        d.id.type === "Identifier" &&
        isComponentName(d.id.name) &&
        isComponentInit(d.init)
      ) {
        candidates.push({ name: d.id.name, node: d.id, isDefault });
      }
    }
  }
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require a file's name to match the component it exports (e.g. button.tsx should export Button).",
      category: "Best Practices",
    },
    messages: {
      mismatch:
        'File "{{filename}}" exports component "{{componentName}}" — rename the file to "{{expected}}" (or rename the component to match the file).',
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: { type: "string" },
          },
          extensions: {
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
    const extensions = options.extensions || [".tsx", ".jsx"];
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};

    const base = filename.split(/[\\/]/).pop() || "";
    const matchedExt = extensions.find((ext) => base.endsWith(ext));
    if (!matchedExt) return {};

    const baseName = base.slice(0, base.length - matchedExt.length);
    const firstSegment = baseName.split(".")[0];
    // `index.tsx` is a barrel/entry-point convention, not a component name.
    if (firstSegment.toLowerCase() === "index") return {};

    return {
      Program(program) {
        const candidates = [];
        for (const stmt of program.body) {
          if (stmt.type === "ExportNamedDeclaration" && stmt.declaration) {
            collectFromDeclaration(stmt.declaration, false, candidates);
          } else if (stmt.type === "ExportDefaultDeclaration") {
            const decl = stmt.declaration;
            if (decl.type === "Identifier") {
              for (const inner of program.body) {
                if (
                  (inner.type === "FunctionDeclaration" ||
                    inner.type === "ClassDeclaration") &&
                  inner.id &&
                  inner.id.name === decl.name
                ) {
                  collectFromDeclaration(inner, true, candidates);
                } else if (inner.type === "VariableDeclaration") {
                  for (const d of inner.declarations) {
                    if (
                      d.id &&
                      d.id.type === "Identifier" &&
                      d.id.name === decl.name &&
                      isComponentName(d.id.name) &&
                      isComponentInit(d.init)
                    ) {
                      candidates.push({
                        name: d.id.name,
                        node: decl,
                        isDefault: true,
                      });
                    }
                  }
                }
              }
            } else {
              collectFromDeclaration(decl, true, candidates);
            }
          }
        }

        if (candidates.length === 0) return;

        const matches = candidates.some(
          (c) => normalize(c.name) === normalize(firstSegment),
        );
        if (matches) return;

        const primary = candidates.find((c) => c.isDefault) || candidates[0];
        context.report({
          node: primary.node,
          messageId: "mismatch",
          data: {
            filename: base,
            componentName: primary.name,
            expected: toKebabCase(primary.name) + matchedExt,
          },
        });
      },
    };
  },
};

module.exports = rule;
