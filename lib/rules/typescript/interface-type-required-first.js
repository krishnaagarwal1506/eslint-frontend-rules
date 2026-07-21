// ESLint rule: Enforce that in TypeScript interfaces and types, all optional fields come after required fields.

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require all required fields to come before optional fields in interfaces and types.",
      category: "Best Practices",
    },
    fixable: "code",
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
    const filename = context.filename;
    if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) return {};
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length) {
      const micromatch = require("micromatch");
      if (micromatch.isMatch(filename, ignorePatterns)) return {};
    }
    const sourceCode = context.sourceCode;

    // `sourceCode.getText(member)` only covers the member's own range — any
    // leading JSDoc/comment block sits *before* that range and would be
    // silently dropped by a plain reorder (a real bug: reordering an
    // interface with doc-commented properties deleted the docs). Re-attach
    // each member's leading comments, while excluding a comment that's
    // actually a *trailing* same-line comment on the previous member.
    function textWithLeadingComments(members, member) {
      const idx = members.indexOf(member);
      const prevMember = idx > 0 ? members[idx - 1] : null;
      const comments = sourceCode.getCommentsBefore(member);
      const leading = comments.filter(
        (c) => !prevMember || c.loc.start.line > prevMember.loc.end.line,
      );
      const start = leading.length ? leading[0].range[0] : member.range[0];
      return sourceCode.text.slice(start, member.range[1]);
    }

    function checkFields(node, parentName, containerNode) {
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
      let needsFix = false;
      for (const member of members) {
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
          needsFix = true;
          context.report({
            node: member.key,
            messageId: "requiredBeforeOptional",
            data: { name: member.key.name, parent: parentName },
            fix(fixer) {
              // Reorder: required fields first, then optional
              const propMembers = members.filter(
                (m) => m.type === "TSPropertySignature" && m.key && m.key.name,
              );
              const required = propMembers.filter((m) => !m.optional);
              const optional = propMembers.filter((m) => m.optional);
              const nonPropMembers = members.filter(
                (m) =>
                  m.type !== "TSPropertySignature" || !m.key || !m.key.name,
              );
              const reordered = [...required, ...optional, ...nonPropMembers];
              const reorderedText = reordered
                .map((m) => textWithLeadingComments(members, m))
                .join("\n");
              // The replaced range must start at the *first* leading comment
              // of the first original member too, or that comment is left
              // behind (duplicated) above whatever member now sits first.
              const firstMember = members[0];
              const lastMember = members[members.length - 1];
              const firstMemberComments = sourceCode.getCommentsBefore(firstMember);
              const rangeStart = firstMemberComments.length
                ? firstMemberComments[0].range[0]
                : firstMember.range[0];
              return fixer.replaceTextRange(
                [rangeStart, lastMember.range[1]],
                reorderedText,
              );
            },
          });
          // Only report first violation per block, fixer handles all
          return;
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
