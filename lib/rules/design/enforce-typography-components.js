// Enforce usage of Typography components instead of raw HTML tags in React JSX.
// Supports an 'ignore' option (array of glob patterns) to skip files.
const micromatch = require("micromatch");

const forbiddenTags = [
  "p",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
];

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce usage of Typography components instead of raw HTML tags",
      category: "Best Practices",
    },
    messages: {
      useTypography:
        "Raw <{{tag}}> tag detected. For consistent design and theming, use the corresponding Typography component (e.g., TypographyP, TypographyH1, TypographyBlockquote, etc.) instead. Import these from components/ui/typography. Native tags are only allowed in typography.tsx.",
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
    // Always ignore typography.tsx
    if (/typography\.tsx$/.test(filename)) return {};
    if (ignorePatterns.length && micromatch.isMatch(filename, ignorePatterns))
      return {};
    return {
      JSXOpeningElement(node) {
        const tag = node.name && node.name.name;
        if (forbiddenTags.includes(tag)) {
          context.report({
            node,
            messageId: "useTypography",
            data: { tag },
          });
        }
      },
    };
  },
};
