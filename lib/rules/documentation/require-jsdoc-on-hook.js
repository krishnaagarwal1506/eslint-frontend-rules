/**
 * @fileoverview Warns if a root-level React hook lacks a JSDoc comment.
 * Supports folder restriction via options.
 */
const micromatch = require("micromatch");
const {
  hasJSDoc,
  isRootLevel,
  createJsdocRule,
} = require("../../utils/documentation");
const { isHookName } = require("../../utils/react");

module.exports = createJsdocRule({
  typePredicate: isHookName,
  messageId: "missingJSDoc",
  defaultMessage: 'React hook "{{name}}" should have a JSDoc comment.',
});
