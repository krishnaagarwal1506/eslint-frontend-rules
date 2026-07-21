const plugin = {
  rules: {
    // Design
    "enforce-typography-components": require("./rules/design/enforce-typography-components"),
    "no-direct-colors": require("./rules/design/no-direct-colors"),
    "no-direct-colors-in-svg-attrs": require("./rules/design/no-direct-colors-in-svg-attrs"),
    // Naming
    "top-level-const-snake": require("./rules/naming/top-level-const-snake"),
    "enforce-interface-type-naming": require("./rules/naming/enforce-interface-type-naming"),
    "enforce-boolean-prop-naming": require("./rules/naming/enforce-boolean-prop-naming"),
    "enforce-css-module-import-name": require("./rules/naming/enforce-css-module-import-name"),
    // Accessibility
    "no-focusable-non-interactive-elements": require("./rules/accessibility/no-focusable-non-interactive-elements"),
    "no-img-missing-alt": require("./rules/accessibility/no-img-missing-alt"),
    "enforce-icon-button-aria-label": require("./rules/accessibility/enforce-icon-button-aria-label"),
    // File Structure
    "enforce-kebab-case-filenames": require("./rules/file-structure/enforce-kebab-case-filenames"),
    // Import/Export
    "no-default-export": require("./rules/import-export/no-default-export"),
    "enforce-alias-import-paths": require("./rules/import-export/enforce-alias-import-paths"),
    // TypeScript
    "interface-type-required-first": require("./rules/typescript/interface-type-required-first"),
    "enforce-enum-member-naming": require("./rules/typescript/enforce-enum-member-naming"),
    // React
    "no-inline-arrow-functions-in-jsx": require("./rules/react/no-inline-arrow-functions-in-jsx"),
    "no-nested-component": require("./rules/react/no-nested-component"),
    "no-unnecessary-fragment": require("./rules/react/no-unnecessary-fragment"),
    "no-unnecessary-curly-in-props": require("./rules/react/no-unnecessary-curly-in-props"),
    "enforce-classname-utility": require("./rules/react/enforce-classname-utility"),
    "enforce-no-empty-classname-utility": require("./rules/react/enforce-no-empty-classname-utility"),
    "enforce-use-state-naming": require("./rules/react/enforce-use-state-naming"),
    "enforce-event-handler-naming": require("./rules/react/enforce-event-handler-naming"),
    "no-unstable-default-props": require("./rules/react/no-unstable-default-props"),

    // Documentation
    "require-jsdoc-on-root-function": require("./rules/documentation/require-jsdoc-on-root-function"),
    "require-jsdoc-on-component": require("./rules/documentation/require-jsdoc-on-component"),
    "require-jsdoc-on-hook": require("./rules/documentation/require-jsdoc-on-hook"),
    // Testing
    "enforce-testid-naming": require("./rules/testing/enforce-testid-naming"),
  },
};

// `recommended` was previously ~all "error", including several rules that
// are fundamentally incompatible with common setups (`no-default-export`
// errors on every Next.js/Remix page file), assume infrastructure most
// projects don't have yet (`enforce-typography-components` assumes a
// Typography component system already exists), or encode a narrow style
// preference rather than a broadly-shared one (`enforce-interface-type-naming`'s
// I-/T- prefixes, `top-level-const-snake`'s ALL_CAPS-everywhere). Defaulting
// those to "error" made the preset break on first use for most real
// codebases. Rebalanced: rules with negligible false-positive risk and clear
// correctness/consistency value stay strict; opinionated or environment-
// dependent rules are "warn" or "off" so teams opt in deliberately. (Also:
// require-jsdoc-on-* now correctly fire on *exported* declarations — see
// utils/documentation.js — which is a much larger surface than before, so
// they're "off" by default rather than "warn".)
plugin.configs = {
  recommended: {
    plugins: {
      "eslint-frontend-rules": plugin,
    },
    rules: {
      // Off: needs project-specific setup (a Typography component system)
      // before it's usable — "error" by default flags every <p>/<span>/<h*>.
      "eslint-frontend-rules/enforce-typography-components": "off",
      // Error: the rule most likely to catch a real bug (a hardcoded color
      // bypassing the design token system) — low false-positive risk.
      "eslint-frontend-rules/no-direct-colors": "error",
      // Off: opinionated convention not shared by most codebases; would
      // flag ordinary camelCase top-level consts (config objects, arrays).
      "eslint-frontend-rules/top-level-const-snake": "off",
      "eslint-frontend-rules/no-focusable-non-interactive-elements": "warn",
      "eslint-frontend-rules/enforce-kebab-case-filenames": "warn",
      // Off: Hungarian-style I-/T- prefixes are explicitly discouraged by
      // most modern TS style guides; not a safe "error" default.
      "eslint-frontend-rules/enforce-interface-type-naming": "off",
      // Off: incompatible with Next.js/Remix/most meta-frameworks, which
      // *require* default exports for page/layout/route files.
      "eslint-frontend-rules/no-default-export": "off",
      "eslint-frontend-rules/interface-type-required-first": "warn",
      // Off: inline arrow props (onClick={() => ...}) are idiomatic, common
      // React; the perf argument only matters with memoized children, which
      // this rule can't detect, so it mostly just adds churn.
      "eslint-frontend-rules/no-inline-arrow-functions-in-jsx": "off",
      "eslint-frontend-rules/enforce-alias-import-paths": "warn",
      // Error: real perf/correctness bug (component redefined every render).
      "eslint-frontend-rules/no-nested-component": "error",
      "eslint-frontend-rules/no-unnecessary-fragment": "warn",
      "eslint-frontend-rules/no-unnecessary-curly-in-props": "warn",
      "eslint-frontend-rules/enforce-classname-utility": "warn",
      "eslint-frontend-rules/enforce-no-empty-classname-utility": "warn",
      "eslint-frontend-rules/enforce-use-state-naming": "warn",
      "eslint-frontend-rules/enforce-event-handler-naming": "warn",
      "eslint-frontend-rules/enforce-boolean-prop-naming": "warn",
      "eslint-frontend-rules/enforce-enum-member-naming": "warn",
      "eslint-frontend-rules/enforce-testid-naming": "warn",
      // Off: correctly firing on exported declarations now (a real fix, see
      // utils/documentation.js) means a much bigger surface than before —
      // start opt-in rather than surprising every consumer on upgrade.
      "eslint-frontend-rules/require-jsdoc-on-root-function": "off",
      "eslint-frontend-rules/require-jsdoc-on-component": "off",
      "eslint-frontend-rules/require-jsdoc-on-hook": "off",

      // New in 4.1.0 — same "warn, not error" default as everything else
      // added since the 4.0.0 rebalance.
      "eslint-frontend-rules/no-img-missing-alt": "warn",
      "eslint-frontend-rules/enforce-icon-button-aria-label": "warn",
      "eslint-frontend-rules/no-direct-colors-in-svg-attrs": "warn",
      "eslint-frontend-rules/enforce-css-module-import-name": "warn",
      "eslint-frontend-rules/no-unstable-default-props": "warn",
    },
  },
};

module.exports = plugin;
