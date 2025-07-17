function hasJSDoc(node, sourceCode) {
  const jsdoc = sourceCode
    .getCommentsBefore(node)
    .find(
      (comment) => comment.type === "Block" && comment.value.startsWith("*")
    );
  return Boolean(jsdoc);
}

function isRootLevel(node) {
  return node.parent && node.parent.type === "Program";
}

module.exports = { hasJSDoc, isRootLevel };
