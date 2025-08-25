/**
 * @fileoverview Warns if className has accidental empty strings or just whitespace (className=" ").
 */

"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow empty Tailwind CSS class strings",
      category: "Best Practices",
    },
    messages: {
      emptyTailwindClass:
        "Empty Tailwind CSS class string found. Remove it or add classes.",
    },
  },
  create: function (context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === "className") {
          const value = node.value;

          if (value.type === "Literal") {
            // className="   " or className=""
            if (typeof value.value === "string" && value.value.trim() === "") {
              context.report({
                node: value,
                messageId: "emptyTailwindClass",
              });
            }
          } else if (value.type === "JSXExpressionContainer") {
            const expression = value.expression;

            // className={""} or className={"   "}
            if (
              expression.type === "Literal" &&
              typeof expression.value === "string" &&
              expression.value.trim() === ""
            ) {
              context.report({
                node: expression,
                messageId: "emptyTailwindClass",
              });
            }
            // className={``} or className={`   `}
            else if (
              expression.type === "TemplateLiteral" &&
              expression.quasis.length === 1 &&
              expression.quasis[0].value.raw.trim() === ""
            ) {
              context.report({
                node: expression,
                messageId: "emptyTailwindClass",
              });
            }
          }
        }
      },
    };
  },
};
