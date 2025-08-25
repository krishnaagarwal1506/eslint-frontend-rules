/**
 * @fileoverview Warns if className has accidental empty strings or just whitespace (className=" ").
 */

"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow empty className strings",
      category: "Best Practices",
    },
    messages: {
      emptyClassName:
        "Empty className string found. Remove it or add valid classes.",
    },
  },
  create: function (context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === "className") {
          const value = node.value;

          if (value?.type === "Literal") {
            // className="   " or className=""
            if (typeof value.value === "string" && value.value.trim() === "") {
              context.report({
                node: value,
                messageId: "emptyClassName",
              });
            }
          } else if (value?.type === "JSXExpressionContainer") {
            const expression = value.expression;

            // className={""} or className={"   "}
            if (
              expression.type === "Literal" &&
              typeof expression.value === "string" &&
              expression.value.trim() === ""
            ) {
              context.report({
                node: expression,
                messageId: "emptyClassName",
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
                messageId: "emptyClassName",
              });
            }
          }
        }
      },
    };
  },
};
