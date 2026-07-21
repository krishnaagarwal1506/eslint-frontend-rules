# eslint-frontend-rules

Reusable ESLint plugin for frontend projects. Enforces code consistency, design standards, and best practices for React/TypeScript codebases.

## 4.1.0

Five new rules (all `"warn"` in `configs.recommended`, consistent with 4.0.0's
"opt-in, not surprising" defaults):

- **no-img-missing-alt** — require an `alt` attribute on raw `<img>` elements.
  Only flags a *missing* attribute, never an empty one (`alt=""` is valid for
  decorative images) — never pressures anyone into meaningless alt text.
- **enforce-icon-button-aria-label** — require `aria-label`,
  `aria-labelledby`, or `title` on a `<button>` whose only content is an icon
  and no visible text.
- **no-direct-colors-in-svg-attrs** — extends `no-direct-colors` to SVG
  presentation attributes (`fill`, `stroke`, `stopColor`), which the original
  rule doesn't check (it only looks at `style`/`className`). Keyword values
  (`currentColor`, `none`, `transparent`) are never flagged.
- **enforce-css-module-import-name** — CSS Module default imports
  (`import X from './x.module.css'`) should use one consistent local name
  (default `styles`) across the codebase. Fixable — renaming a default
  import's local binding never changes what's actually imported, so this one
  is safe to auto-fix (unlike the named-import case documented in 4.0.0).
- **no-unstable-default-props** — flags `{ items = [] }`-style destructured
  parameter defaults in components/hooks: an object/array/function literal
  default is a *new* reference every call, silently breaking memoization and
  any reference-equality check downstream.

## 4.0.0

A real-world adoption surfaced several autofixer bugs badly enough that `--fix`
(which `lint-staged`/pre-commit hooks run regardless of a rule's severity)
corrupted otherwise-working code. This release fixes those, tightens a few
other fixers that could silently produce broken renames, and rebalances
`configs.recommended` — previously almost everything was `"error"`, including
rules that are either environment-incompatible (`no-default-export` errors on
every Next.js page) or require setup most projects don't have yet
(`enforce-typography-components`). Bumped as a major version because the
`recommended` export's behavior changes materially.

**Fixed:**

- `no-focusable-non-interactive-elements`: the fixer inserted a *second*
  `role` attribute on an element that already had one (e.g. `role="dialog"`),
  producing `react/jsx-no-duplicate-props`; and it string-sliced the
  `onClick` handler's source assuming it was `{identifier}`, breaking anything
  else (e.g. an inline arrow) into an invalid statement. Now checks for *any*
  existing `role`, and wraps the original handler expression in parens
  (`(EXPR)(e)`) instead of guessing its shape.
- `no-unnecessary-fragment`: unwrapping `<>{child}</>` to bare `child` is only
  valid when the fragment sits in direct JSX-children position. A fragment as
  a `{cond && <>...</>}` operand (or similar) produced a parse error when
  "fixed". Now only autofixes the provably-safe case; still reports (without
  fixing) elsewhere.
- `enforce-event-handler-naming`: the fixer could rename an *imported*
  function used as a handler, which renames the import specifier itself and
  breaks module resolution. Now only renames plain local declarations, and no
  longer applies a blind fallback rename when the binding can't be resolved.
- `enforce-interface-type-naming` / `enforce-boolean-prop-naming`: these
  fixers renamed only the type declaration / property key, never any of its
  usages (JSX props, destructured params, other type references) — a
  guaranteed type error, not a cosmetic diff. Full-reference renaming for
  type-level identifiers isn't reliably verifiable across
  `@typescript-eslint/parser` versions, so these are now detection-only (no
  `fixable`).
- `interface-type-required-first`: reordering fields dropped any leading
  JSDoc/comment attached to a reordered member (`sourceCode.getText(member)`
  doesn't include it). Now re-attaches each member's leading comments.
- `enforce-kebab-case-filenames`: split the filename on `/` only, so on
  Windows (`context.filename` uses `\`) it checked the *entire absolute path*
  as if it were the basename, misfiring on every file. Matches either
  separator now.
- `enforce-classname-utility`: the documented/schema'd `allow` option was
  never actually read — every template-literal className was flagged
  regardless. Now honored for template literals with no interpolation.
- `enforce-alias-import-paths`: flagged *every* relative import, including
  ordinary same-directory siblings (`./types`, the app's own `./globals.css`)
  — idiomatic in most codebases, not just deep `../../../` staircases. Added
  `allowSameDirectory` (default `true`) and `maxParentDepth` (default `1`) so
  only genuinely deep relative paths are flagged by default.

**`configs.recommended` changes** (rule → new default):
`enforce-typography-components` error→off,
`top-level-const-snake` error→off,
`enforce-interface-type-naming` error→off,
`no-default-export` error→off,
`no-inline-arrow-functions-in-jsx` warn→off,
`no-focusable-non-interactive-elements` error→warn,
`enforce-kebab-case-filenames` error→warn,
`interface-type-required-first` error→warn,
`require-jsdoc-on-root-function`/`-component`/`-hook` warn→off (these now
correctly fire on *exported* declarations — see below — which is a much
larger surface than before, so start opt-in).
Everything else is unchanged. Override any rule's level in your own `rules`
block same as always.

**Also fixed:** `require-jsdoc-on-root-function`, `require-jsdoc-on-component`,
and `require-jsdoc-on-hook` share a root-level check that only matched
`node.parent.type === "Program"` — but `export function Foo() {}` and
`export const Foo = () => {}` have an `ExportNamedDeclaration`/
`ExportDefaultDeclaration` parent, not `Program` directly. Since real
components/hooks are almost always exported, these rules previously never
fired on the case they exist for. Fixed (and the JSDoc-insertion fixer now
inserts before `export`, not between `export` and the declaration keyword).

## Installation

```
npm install --save-dev eslint-frontend-rules
```

## Usage

Add `eslint-frontend-rules` to your ESLint config:

```json
{
  "extends": [
      frontendRules.configs.recommended,
    ],
  "plugins": {
      "eslint-frontend-rules": frontendRules,
    },
  "rules": {
    // Optionally override rule levels or options here
  }
}
```

## Included Rules

### 1. enforce-typography-components

**Enforces the use of Typography components instead of raw HTML tags (`<p>`, `<span>`, `<h1>`-`<h6>`, `<blockquote>`) in React JSX.**

- Native tags are only allowed in `typography.tsx` (or configure ignore patterns).
- Error: Raw <p> tag detected. Use Typography components (e.g., TypographyP, TypographyH1, TypographyBlockquote).
- Options: `ignore` (array of glob patterns)

### 2. no-direct-colors

**Prevents the use of direct color values in inline styles or classNames.**

- Disallows hex codes, rgb(a), hsl(a), and named colors in style/className.
- Allows CSS variables or theme tokens.
- Error: Do not use direct color values (e.g., '#fff', 'red', 'rgb(0,0,0)').
- Options: `ignore` (array of glob patterns)

### 3. top-level-const-snake

**Requires top-level const variable names to be ALL_CAPS (snake case) in `.tsx` files.**

- Functions are ignored.
- Options: `ignore` (array of glob patterns)

### 4. no-focusable-non-interactive-elements

**Flags non-interactive elements (e.g., `<div>`) with `onClick` but missing `role="button"` or `onKeyDown`.**

- Skips custom components and interactive HTML elements.
- Options: `ignore` (array of glob patterns)

### 5. enforce-kebab-case-filenames

**Enforces kebab-case format for file names.**

- Default: `.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.css` (configurable)
- Checks only the part before the first dot.
- Options: `ignore`, `extensions` (array)

### 6. enforce-interface-type-naming

**Enforces naming conventions for TypeScript interfaces and types.**

- Interfaces: must start with `I` or end with `Props`.
- Types: must start with `T` or end with `Props`.
- Options: `ignore` (array of glob patterns)
- **Not autofixable.** Renaming the declaration alone would leave every usage
  (JSX props, other type references) pointing at the old name — a type
  error, not a cosmetic diff. Rename with your editor's "Rename Symbol"
  instead.

### 7. no-default-export

**Disallows default exports; enforces named exports only.**

- Options: `ignore` (array of glob patterns)

### 8. no-inline-arrow-functions-in-jsx

**Warns on inline arrow functions in JSX props (e.g., `onClick={() => ...}`).**

- Options: `ignore` (array of glob patterns)

### 9. enforce-alias-import-paths

**Enforces the use of alias import paths instead of deep relative paths (e.g., '@/components/Button' instead of '../../../components/Button').**

- Helps maintain consistent and readable import statements by requiring configured alias prefixes.
- Default allowed alias: `@`. You can configure more aliases in your ESLint config.
- By default, ordinary same-directory-or-deeper imports (`./sibling`,
  `./components/x`) and single-level-up imports (`../sibling`) are **allowed**
  — only genuinely deep `../../`-style staircases are flagged. This is
  deliberate: most codebases use plain relative imports for closely-coupled,
  co-located files, and flagging *every* relative import (including the
  app's own `./globals.css`) is mostly noise, not a real problem.
- Options:
  - `aliases`: Array of allowed alias prefixes for import paths (e.g., `['@', '@components', '@utils']`).
  - `ignore`: Array of glob patterns matched against the **file being linted**
    (not the import path) — files matching are skipped entirely.
  - `allowSameDirectory` (default `true`): allow any `./...` import
    regardless of depth.
  - `maxParentDepth` (default `1`): how many leading `../` segments are
    allowed before flagging. `../sibling` (depth 1) passes by default;
    `../../sibling` (depth 2) is flagged. Set to `0` to flag every `../`
    import, or `Infinity` to never flag on depth alone.

**Example configuration:**

```js
// .eslintrc.js
rules: {
  'eslint-frontend-rules/enforce-alias-import-paths': [
    'error',
    {
      aliases: ['@', '@components', '@utils'],
      ignore: ['**/*.test.tsx'],
      allowSameDirectory: true,
      maxParentDepth: 1,
    }
  ]
}
```

### 10. no-nested-component

**Disallows defining a new component inside another component.**

- Prevents declaring a React component (function or class) inside the body of another component.
- All components should be defined at the top level of the file for performance and maintainability.
- Error: Do not define a new component inside another component. Move it to the top level of the file.
- Options: `ignore` (array of glob patterns)

**Why?**

- Inner components are recreated on every render, breaking memoization and harming performance.
- Encourages clear, maintainable code structure.

### 11. no-unnecessary-fragment

**Warns if React fragments (`<>...</>`, `<React.Fragment>...</React.Fragment>`, or `<Fragment>...</Fragment>`) are unnecessary.**

- Warns when a fragment wraps only a single child or is not needed for grouping.
- Supports both short syntax (`<>...</>`) and named fragments (`<React.Fragment>`, `<Fragment>`).
- Helps keep JSX clean and readable by removing redundant fragments.
- No options.

**Example:**

```jsx
// Warns:
return (
  <>
    <div />
  </>
);

return (
  <Fragment>
    <div />
  </Fragment>
);

return (
  <React.Fragment>
    <div />
  </React.Fragment>
);

// OK:
return (
  <>
    <div />
    <span />
  </>
);
```

### 12. require-jsdoc-on-root-function

**Warns if a root-level function (not a React component or hook) lacks a JSDoc comment.**

- Only applies to root-level functions (not inside a component/class).
- Skips React components (names starting with uppercase) and hooks (names starting with `use`).
- Supports folder restriction via options (e.g., only in `utils/`).
- Error: Root-level function "myFunction" should have a JSDoc comment.
- Options:
  - `folders`: Array of glob patterns to restrict rule to certain folders/files.

**Example configuration:**

```js
rules: {
  'eslint-frontend-rules/require-jsdoc-on-root-function': [
    'warn',
    { folders: ['src/utils/**'] }
  ]
}
```

**Example:**

```js
// Warns:
function myUtil() {
  /* ... */
}

const doSomething = () => {
  /* ... */
};

// OK (has JSDoc):
/**
 * Adds two numbers.
 */
function add(a, b) {
  return a + b;
}

// OK (component):
function MyComponent() {
  return <div />;
}

// OK (hook):
function useCustomHook() {
  /* ... */
}
```

### 13. require-jsdoc-on-component

**Warns if a root-level React component lacks a JSDoc comment.**

- Only applies to root-level functions that are React components (name starts with uppercase letter).
- Supports folder restriction via options (e.g., only in `components/`).
- Error: Root-level React component "MyComponent" should have a JSDoc comment.
- Options:
  - `folders`: Array of glob patterns to restrict rule to certain folders/files.

**Example configuration:**

```js
rules: {
  'eslint-frontend-rules/require-jsdoc-on-component': [
    'warn',
    { folders: ['src/components/**'] }
  ]
}
```

**Example:**

```js
// Warns:
function MyComponent() {
  return <div />;
}

const Button = () => <button />;

// OK (has JSDoc):
/**
 * My button component.
 */
function Button() {
  return <button />;
}
```

### 14. require-jsdoc-on-hook

**Warns if a root-level React hook lacks a JSDoc comment.**

- Only applies to root-level functions that are hooks (name starts with `use` followed by uppercase letter or digit).
- Supports folder restriction via options (e.g., only in `hooks/`).
- Error: Root-level React hook "useCustom" should have a JSDoc comment.
- Options:
  - `folders`: Array of glob patterns to restrict rule to certain folders/files.

**Example configuration:**

```js
rules: {
  'eslint-frontend-rules/require-jsdoc-on-hook': [
    'warn',
    { folders: ['src/hooks/**'] }
  ]
}
```

**Example:**

```js
// Warns:
function useCustom() {
  // ...
}

const useSomething = () => {
  /* ... */
};

// OK (has JSDoc):
/**
 * Custom hook for ...
 */
function useCustom() {
  // ...
}
```

### 15. no-unnecessary-curly-in-props

**Warns if JSX props use unnecessary curly braces for string literals.**

- Example: `<Component name={'xyz'} />` (should be `<Component name="xyz" />`)
- Auto-fixable: will convert `{'xyz'}` to `"xyz"` in props.
- No options.

**Example:**

```jsx
// Warns and auto-fixes:
<Component name={'xyz'} />

// OK:
<Component name="xyz" />
<Component name={someVar} />
<Component name="" /> // allowed by default
```

### 16. enforce-classname-utility

**Warns if the `className` prop in JSX is set to a template string (e.g., `` className={`foo ${bar}`} ``) instead of using a function or library (like `cn`).**

- Example: `<Component className={\`foo ${bar}\`} />`(should use`cn` or a similar utility)
- Allows plain string literals (e.g., `className="foo bar"`) and empty string by default.
- Options:
  - `allow`: Array of allowed string literal values for className (default: `[""]`).

**Example configuration:**

```js
rules: {
  'eslint-frontend-rules/enforce-classname-utility': [
    'warn',
    { allow: [""] }
  ]
}
```

**Example:**

```jsx
// Warns:
<Component className={`foo ${bar}`} />
<Component className={`btn ${isActive ? 'active' : ''}`} />

// OK:
<Component className={cn('foo', { active })} />
<Component className={someVar} />
<Component className="foo bar" />
<Component className="" /> // allowed by default

```
### 17. no-empty-classname

**Disallows empty or whitespace-only `className` attributes in JSX.**

- Flags cases where `className` is set but contains no usable value.
- Helps keep code clean by avoiding unnecessary `className=""`, `className="   "`, or `className={""}`.
- Works with string literals, expression containers, and template literals.
- No options.

**Error:** Empty className string found. Remove it or add valid classes.

**Example:**

```jsx
// ❌ Warns:
<div className="" />
<div className="   " />
<div className={""} />
<div className={`   `} />

// ✅ OK:
<div className="btn primary" />
<div className={isActive ? "btn-active" : "btn"} />
<div />
```

### 18. no-img-missing-alt

**Requires an `alt` attribute on raw `<img>` elements.**

- Only flags a *missing* `alt` attribute — never an empty one. `alt=""` is
  valid and intentional for purely decorative images, so this rule never
  pressures anyone into writing meaningless alt text.
- Skips images marked `aria-hidden="true"` (already hidden from assistive
  tech) and images using spread props (`<img {...imgProps} />` — the `alt`
  may already be included, can't know statically).
- No autofix (a meaningful description requires human judgment).
- Options: `ignore` (array of glob patterns)

**Example:**

```jsx
// Warns:
<img src="cat.png" />

// OK:
<img src="cat.png" alt="A cat asleep on a windowsill" />
<img src="divider.png" alt="" />
<img src="cat.png" aria-hidden="true" />
```

### 19. enforce-icon-button-aria-label

**Requires an accessible name (`aria-label`, `aria-labelledby`, or `title`) on a `<button>` whose only content is an icon.**

- A button with visible text content (`<button><X/>Close</button>`) is never
  flagged — the text already provides an accessible name.
- A button whose only child is a dynamic expression (`{label}`) is not
  flagged either — it might render text at runtime; can't know statically.
- No autofix (the right label is a human judgment call).
- Options: `ignore` (array of glob patterns)

**Example:**

```jsx
// Warns:
<button onClick={onClose}><X size={16} /></button>

// OK:
<button aria-label="Close" onClick={onClose}><X size={16} /></button>
<button onClick={onClose}><X size={16} />Close</button>
```

### 20. no-direct-colors-in-svg-attrs

**Prevents direct color values in SVG presentation attributes (`fill`, `stroke`, `stopColor`, and their flood/lighting-color equivalents).**

- Companion to `no-direct-colors`, which only checks `style`/`className` —
  this covers the SVG-specific attributes that rule doesn't reach.
- Keyword values (`currentColor`, `none`, `transparent`, `inherit`) are never
  flagged — they reference context, not a literal color.
- Options: `ignore` (array of glob patterns)

**Example:**

```jsx
// Warns:
<circle fill="#4285F4" />
<line stroke="rgb(0,0,0)" />

// OK:
<circle fill="var(--accent)" />
<path fill="currentColor" />
```

### 21. enforce-css-module-import-name

**Enforces one consistent local name for CSS Module default imports (default: `styles`).**

- Only checks default/namespace imports from a `*.module.{css,scss,sass,less}`
  file — not named imports (some setups also export a member per class name;
  those aren't a single "module object" to standardize a name for).
- **Autofixable**, and safely so: unlike a named import specifier (where the
  identifier *is* the external export's name), a default import's local name
  is a free local alias — renaming it, and every reference to it, never
  changes what's actually imported.
- Options:
  - `expectedName` (default `"styles"`)
  - `ignore` (array of glob patterns)

**Example:**

```jsx
// Warns and auto-fixes (renames the import AND every usage):
import css from './card.module.css'
function Card() { return <div className={css.root} /> }

// OK:
import styles from './card.module.css'
function Card() { return <div className={styles.root} /> }
```

### 22. no-unstable-default-props

**Disallows object/array/function literal default values in a component or hook's destructured parameters.**

- `function Card({ items = [] }) {}` creates a *new* array every call — if
  `items` is ever passed to a memoized child, an effect dependency array, or
  compared by reference anywhere downstream, that comparison silently fails
  every time, defeating the memoization.
- Scoped to components (PascalCase name) and hooks (`use*` name) — not every
  function — since that's specifically where props/dependency-array
  reference comparisons matter.
- Also checks a default on the *whole* destructured parameter
  (`{ a = 1 } = {}`), not just on individual properties.
- No autofix (hoisting to a well-named module-level constant is a judgment
  call: name, placement, and whether it should be shared).
- Options: `ignore` (array of glob patterns)

**Example:**

```jsx
// Warns:
function Card({ items = [] }) { /* ... */ }
function useThing({ options = {} } = {}) { /* ... */ }

// OK:
const EMPTY_ITEMS = [];
function Card({ items = EMPTY_ITEMS }) { /* ... */ }
function Card({ count = 0, label = 'untitled' }) { /* ... */ } // primitives are always fine
```

## Example: Custom Rule Options

```json
{
  "rules": {
    "eslint-frontend-rules/enforce-typography-components": [
      "error",
      { "ignore": ["**/legacy/**/*.tsx"] }
    ],
    "eslint-frontend-rules/no-direct-colors": [
      "error",
      { "ignore": ["**/test-utils/**"] }
    ],
    "eslint-frontend-rules/enforce-kebab-case-filenames": [
      "error",
      { "extensions": [".js", ".ts", ".json"] }
    ],
    "eslint-frontend-rules/no-inline-arrow-functions-in-jsx": [
      "warn",
      { "ignore": ["**/storybook/**"] }
    ],
    "eslint-frontend-rules/enforce-alias-import-paths": [
      "error",
      {
        "aliases": ["@"],
        "ignore": ["**/node_modules/**"]
      }
    ]
  }
}
```

## License

MIT
