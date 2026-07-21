// Shared by design/no-direct-colors and design/no-direct-colors-in-svg-attrs.
const COLOR_REGEX =
  /#([0-9a-fA-F]{3,8})|rgb[a]?\([^)]*\)|hsl[a]?\([^)]*\)|\b(aliceblue|antiquewhite|aqua|black|blue|brown|chartreuse|coral|crimson|cyan|fuchsia|gold|gray|green|indigo|ivory|khaki|lavender|lime|linen|magenta|maroon|navy|olive|orange|orchid|peru|pink|plum|purple|red|salmon|sienna|silver|skyblue|tan|teal|thistle|tomato|turquoise|violet|white|yellow)\b/i;

function isDirectColor(value) {
  return typeof value === "string" && COLOR_REGEX.test(value);
}

module.exports = { COLOR_REGEX, isDirectColor };
