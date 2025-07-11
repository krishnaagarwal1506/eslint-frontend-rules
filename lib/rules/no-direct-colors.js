// Disallow direct color values in styles or classNames. Supports an 'ignore' option (array of glob patterns) to skip files.
const micromatch = require("micromatch");

const COLOR_REGEX =
  /#([0-9a-fA-F]{3,8})|rgb[a]?\([^)]*\)|hsl[a]?\([^)]*\)|\b(aliceblue|antiquewhite|aqua|black|blue|brown|chartreuse|coral|crimson|cyan|fuchsia|gold|gray|green|indigo|ivory|khaki|lavender|lime|linen|magenta|maroon|navy|olive|orange|orchid|peru|pink|plum|purple|red|salmon|sienna|silver|skyblue|tan|teal|thistle|tomato|turquoise|violet|white|yellow)\b/i;

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow direct color values in styles or classNames. Use CSS variables or theme tokens.",
      category: "Best Practices",
    },
    messages: {
      noDirectColor:
        "Do not use direct color values (e.g., '#fff', 'red', 'rgb(0,0,0)') in styles or classNames. Use CSS variables or theme tokens instead.",
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
    const options = context.options[0] || {};
    const ignorePatterns = options.ignore || [];
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};
    console.log(
      `Checking file: ${filename} for direct color values in styles or classNames`
    );
    function checkValue(node, value) {
      if (typeof value === "string" && COLOR_REGEX.test(value)) {
        context.report({ node, messageId: "noDirectColor" });
      }
    }
    return {
      JSXAttribute(node) {
        if (
          node.name &&
          (node.name.name === "style" || node.name.name === "className")
        ) {
          if (node.value && node.value.type === "JSXExpressionContainer") {
            // style={{ color: '#fff' }}
            if (
              node.name.name === "style" &&
              node.value.expression &&
              node.value.expression.type === "ObjectExpression"
            ) {
              node.value.expression.properties.forEach((prop) => {
                if (
                  prop.type === "Property" &&
                  prop.key &&
                  (prop.key.name === "color" ||
                    prop.key.name === "background" ||
                    prop.key.name === "backgroundColor" ||
                    prop.key.name === "borderColor")
                ) {
                  if (prop.value.type === "Literal") {
                    checkValue(prop.value, prop.value.value);
                  } else if (prop.value.type === "TemplateLiteral") {
                    checkValue(
                      prop.value,
                      prop.value.quasis.map((q) => q.value.cooked).join("")
                    );
                  }
                }
              });
            }
            // className={...}
            if (node.name.name === "className") {
              if (node.value.expression.type === "Literal") {
                checkValue(node.value, node.value.expression.value);
              } else if (node.value.expression.type === "TemplateLiteral") {
                checkValue(
                  node.value,
                  node.value.expression.quasis
                    .map((q) => q.value.cooked)
                    .join("")
                );
              }
            }
          } else if (node.value && node.value.type === "Literal") {
            // className="bg-[#fff] text-red"
            checkValue(node.value, node.value.value);
          }
        }
      },
    };
  },
};
