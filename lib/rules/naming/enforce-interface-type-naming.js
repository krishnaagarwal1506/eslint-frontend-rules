// ESLint rule: Enforce naming conventions for TypeScript interfaces and types in .ts/.tsx files.
// Interfaces: must start with 'I' or end with 'Props'.
// Types: must start with 'T' or end with 'Props'.

const INTERFACE_REGEX = /^(I[A-Z][A-Za-z0-9]*|[A-Za-z0-9]+Props)$/;
const TYPE_REGEX = /^(T[A-Z][A-Za-z0-9]*|[A-Za-z0-9]+Props)$/;

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce 'I' prefix or 'Props' suffix for interfaces, and 'T' prefix or 'Props' suffix for types in TypeScript files.",
      category: "Best Practices",
    },
    // Intentionally NOT fixable: renaming only the declaration id (as a
    // previous version did) leaves every usage of the interface/type
    // elsewhere in the file pointing at a now-undefined name — a guaranteed
    // type error, not a cosmetic issue. Type-level scope/reference tracking
    // varies across @typescript-eslint/parser versions, so a full rename
    // (declaration + every reference) can't be verified safe here. Report
    // only; let the author rename with their editor's "Rename Symbol".
    messages: {
      badInterfaceName:
        "Interface '{{name}}' should start with 'I' or end with 'Props'.",
      badTypeName: "Type '{{name}}' should start with 'T' or end with 'Props'.",
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
    if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) return {};
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    return {
      TSInterfaceDeclaration(node) {
        const name = node.id.name;
        if (!INTERFACE_REGEX.test(name)) {
          context.report({
            node: node.id,
            messageId: "badInterfaceName",
            data: { name },
          });
        }
      },
      TSTypeAliasDeclaration(node) {
        const name = node.id.name;
        if (!TYPE_REGEX.test(name)) {
          context.report({
            node: node.id,
            messageId: "badTypeName",
            data: { name },
          });
        }
      },
    };
  },
};

module.exports = rule;
