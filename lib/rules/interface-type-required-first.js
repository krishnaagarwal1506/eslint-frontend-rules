// ESLint rule: Enforce that in TypeScript interfaces and types, all optional fields come after required fields.

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require all required fields to come before optional fields in interfaces and types.",
      category: "Best Practices",
    },
    messages: {
      requiredBeforeOptional:
        "Required field '{{name}}' should come before all optional fields in '{{parent}}'.",
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
    const filename = context.getFilename();
    if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) return {};
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    function checkFields(node, parentName) {
      let members = [];
      // For TSInterfaceDeclaration: node.body.body is the array of members
      if (node.body && Array.isArray(node.body.body)) {
        members = node.body.body;
      } else if (node.body && Array.isArray(node.body)) {
        members = node.body;
      } else if (node.members && Array.isArray(node.members)) {
        members = node.members;
      }
      // If no members, nothing to check
      if (!members.length) return;
      let foundOptional = false;
      for (const member of members) {
        // Check if the member is a property signature with a name
        if (
          member.type !== "TSPropertySignature" ||
          !member.key ||
          !member.key.name
        )
          continue;
        const isOptional = !!member.optional;
        if (isOptional) {
          foundOptional = true;
        } else if (foundOptional) {
          // Found a required field after an optional field
          context.report({
            node: member.key,
            messageId: "requiredBeforeOptional",
            data: { name: member.key.name, parent: parentName },
          });
        }
      }
    }
    return {
      TSInterfaceDeclaration(node) {
        checkFields(node.body, node.id.name);
      },
      TSTypeAliasDeclaration(node) {
        if (
          node.typeAnnotation &&
          node.typeAnnotation.type === "TSTypeLiteral"
        ) {
          checkFields(node.typeAnnotation, node.id.name);
        }
      },
    };
  },
};

module.exports = rule;
