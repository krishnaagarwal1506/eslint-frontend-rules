/**
 * @fileoverview Warns if a root-level function lacks a JSDoc comment.
 * Supports folder restriction via options.
 */

const { createJsdocRule } = require("../../utils/documentation");
const { isRootFunction } = require("../../utils/react");

module.exports = createJsdocRule({
  typePredicate: isRootFunction,
  messageId: "missingJSDoc",
  defaultMessage: 'Root-level function "{{name}}" should have a JSDoc comment.',
});
