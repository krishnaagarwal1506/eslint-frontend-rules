/**
 * @fileoverview Enforce consistent naming for TypeScript enum members.
 * Enum members should be in PascalCase or UPPER_SNAKE_CASE.
 */
const micromatch = require("micromatch");

const PASCAL_CASE_REGEX = /^[A-Z][A-Za-z0-9]*$/;
const UPPER_SNAKE_REGEX = /^[A-Z][A-Z0-9_]*$/;

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce that TypeScript enum members use PascalCase or UPPER_SNAKE_CASE naming.",
      category: "Best Practices",
    },
    messages: {
      badEnumMemberName:
        'Enum member "{{name}}" should be in PascalCase or UPPER_SNAKE_CASE.',
    },
    schema: [
      {
        type: "object",
        properties: {
          convention: {
            type: "string",
            enum: ["PascalCase", "UPPER_SNAKE_CASE", "both"],
            description:
              "Which naming convention to enforce. Default: both (allows either).",
          },
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
    const convention = options.convention || "both";
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};

    function isValidName(name) {
      if (convention === "PascalCase") return PASCAL_CASE_REGEX.test(name);
      if (convention === "UPPER_SNAKE_CASE")
        return UPPER_SNAKE_REGEX.test(name);
      return PASCAL_CASE_REGEX.test(name) || UPPER_SNAKE_REGEX.test(name);
    }

    return {
      TSEnumMember(node) {
        const key = node.id;
        if (!key) return;
        const name = key.type === "Identifier" ? key.name : null;
        if (!name) return;
        if (!isValidName(name)) {
          context.report({
            node: key,
            messageId: "badEnumMemberName",
            data: { name },
          });
        }
      },
    };
  },
};
