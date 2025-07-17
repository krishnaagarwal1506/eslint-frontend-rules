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

// Helper: is a function/class a React component?
function isComponent(node) {
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    // Heuristic: name starts with uppercase, or returns JSX
    if (node.id && /^[A-Z]/.test(node.id.name)) return true;
    if (
      node.parent &&
      node.parent.type === "VariableDeclarator" &&
      /^[A-Z]/.test(node.parent.id.name)
    )
      return true;
    // Returns JSX (JSXElement or JSXFragment)
    if (node.body && node.body.type === "BlockStatement") {
      return node.body.body.some(
        (stmt) =>
          stmt.type === "ReturnStatement" &&
          stmt.argument &&
          (stmt.argument.type === "JSXElement" ||
            stmt.argument.type === "JSXFragment")
      );
    }
  }
  if (
    node.type === "ClassDeclaration" &&
    node.id &&
    /^[A-Z]/.test(node.id.name)
  ) {
    return true;
  }
  return false;
}

function isComponentName(name) {
  return name && /^[A-Z]/.test(name);
}
function isHookName(name) {
  return name && /^use[A-Z0-9]/.test(name);
}

function isRootFunction(name) {
  return name && !isComponentName(name) && !isHookName(name);
}

module.exports = {
  getMeaningfulChildren,
  isFragmentElement,
  isComponent,
  isComponentName,
  isRootFunction,
  isHookName,
};
