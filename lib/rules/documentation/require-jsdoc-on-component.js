/**
 * @fileoverview Warns if a root-level React component lacks a JSDoc comment.
 * Supports folder restriction via options.
 */
const micromatch = require("micromatch");
const {
  hasJSDoc,
  isRootLevel,
  createJsdocRule,
} = require("../../utils/documentation");
const { isComponentName } = require("../../utils/react");

module.exports = createJsdocRule({
  typePredicate: isComponentName,
  messageId: "missingJSDoc",
  defaultMessage: 'React component "{{name}}" should have a JSDoc comment.',
});
