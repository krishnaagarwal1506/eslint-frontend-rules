/**
 * @fileoverview Enforce that boolean props in TypeScript interfaces/types follow
 * naming conventions (is*, has*, should*, can*, will*, did*).
 */
const micromatch = require("micromatch");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce boolean prop names to start with is/has/should/can/will/did.",
      category: "Best Practices",
    },
    // Intentionally NOT fixable: this flags a prop *type's* key. Renaming just
    // that key (as a previous version did, and always to a hardcoded "is"
    // prefix regardless of the configured `prefixes`) leaves every real usage
    // — destructured params, JSX prop names — pointing at the old name, which
    // is a type error, not a cosmetic diff. A correct fix needs full type
    // information to find every call site; a plain AST rule can't do that
    // safely.
    messages: {
      booleanPropNaming:
        'Boolean prop "{{name}}" should start with is, has, should, can, will, or did (e.g., "is{{capitalized}}").',
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: { type: "string" },
          },
          prefixes: {
            type: "array",
            items: { type: "string" },
            description: "Allowed prefixes for boolean props.",
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
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};
    const prefixes = options.prefixes || [
      "is",
      "has",
      "should",
      "can",
      "will",
      "did",
    ];
    const prefixRegex = new RegExp(`^(${prefixes.join("|")})[A-Z]`);

    function checkMember(member) {
      if (member.type !== "TSPropertySignature") return;
      if (!member.key || !member.key.name) return;
      // Check if the type annotation is boolean
      const typeAnnotation =
        member.typeAnnotation && member.typeAnnotation.typeAnnotation;
      if (!typeAnnotation) return;
      const isBooleanType =
        typeAnnotation.type === "TSBooleanKeyword" ||
        (typeAnnotation.type === "TSUnionType" &&
          typeAnnotation.types.every(
            (t) =>
              t.type === "TSBooleanKeyword" ||
              (t.type === "TSLiteralType" &&
                typeof t.literal.value === "boolean") ||
              t.type === "TSUndefinedKeyword",
          ));
      if (!isBooleanType) return;
      const name = member.key.name;
      if (!prefixRegex.test(name)) {
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        context.report({
          node: member.key,
          messageId: "booleanPropNaming",
          data: { name, capitalized },
        });
      }
    }

    return {
      TSInterfaceDeclaration(node) {
        const members =
          (node.body && node.body.body) || node.body || node.members || [];
        members.forEach(checkMember);
      },
      TSTypeAliasDeclaration(node) {
        if (
          node.typeAnnotation &&
          node.typeAnnotation.type === "TSTypeLiteral"
        ) {
          const members = node.typeAnnotation.members || [];
          members.forEach(checkMember);
        }
      },
    };
  },
};
