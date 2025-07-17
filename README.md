# eslint-frontend-rules

Reusable ESLint plugin for frontend projects. Enforces code consistency, design standards, and best practices for React/TypeScript codebases.

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

### 7. no-default-export

**Disallows default exports; enforces named exports only.**

- Options: `ignore` (array of glob patterns)

### 8. no-inline-arrow-functions-in-jsx

**Warns on inline arrow functions in JSX props (e.g., `onClick={() => ...}`).**

- Options: `ignore` (array of glob patterns)

### 9. enforce-alias-import-paths

**Enforces the use of alias import paths instead of relative paths (e.g., '@/components/Button' instead of '../../components/Button').**

- Helps maintain consistent and readable import statements by requiring configured alias prefixes.
- Default allowed alias: `@`. You can configure more aliases in your ESLint config.
- Options:
  - `aliases`: Array of allowed alias prefixes for import paths (e.g., `['@', '@components', '@utils']`).
  - `ignore`: Array of glob patterns to ignore files or import paths.

**Example configuration:**

```js
// .eslintrc.js
rules: {
  'eslint-frontend-rules/enforce-alias-import-paths': [
    'error',
    {
      aliases: ['@', '@components', '@utils'],
      ignore: ['**/*.test.tsx']
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

const useSomething = () => { /* ... */ };

// OK (has JSDoc):
/**
 * Custom hook for ...
 */
function useCustom() {
  // ...
}
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
