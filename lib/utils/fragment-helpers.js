/**
 * Utility functions for React fragment lint rules.
 */

function getMeaningfulChildren(children) {
  return children.filter((child) => {
    if (child.type === "JSXText") return child.value.trim() !== "";
    if (
      child.type === "JSXExpressionContainer" &&
      child.expression.type === "JSXEmptyExpression"
    )
      return false;
    if (
      child.type === "JSXExpressionContainer" &&
      child.expression.type === "Literal" &&
      typeof child.expression.value === "string" &&
      child.expression.value.trim() === ""
    )
      return false;
    if (
      child.type === "JSXExpressionContainer" &&
      child.expression.type === "JSXFragment"
    )
      return true;
    if (child.type === "JSXElement" || child.type === "JSXFragment")
      return true;
    // Ignore comments
    return (
      child.type !== "JSXExpressionContainer" ||
      child.expression.type !== "JSXEmptyExpression"
    );
  });
}

function isFragmentElement(node) {
  return (
    node.openingElement &&
    ((node.openingElement.name.type === "JSXMemberExpression" &&
      node.openingElement.name.object.name === "React" &&
      node.openingElement.name.property.name === "Fragment") ||
      (node.openingElement.name.type === "JSXIdentifier" &&
        node.openingElement.name.name === "Fragment"))
  );
}

module.exports = {
  getMeaningfulChildren,
  isFragmentElement,
};
