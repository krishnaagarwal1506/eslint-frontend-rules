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
  "plugins": ["eslint-frontend-rules"],
  "extends": ["plugin:eslint-frontend-rules/recommended"],
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

## Example: Custom Rule Options

```json
{
  "rules": {
    "eslint-frontend-rules/enforce-typography-components": ["error", { "ignore": ["**/legacy/**/*.tsx"] }],
    "eslint-frontend-rules/no-direct-colors": ["error", { "ignore": ["**/test-utils/**"] }],
    "eslint-frontend-rules/enforce-kebab-case-filenames": ["error", { "extensions": [".js", ".ts", ".json"] }],
    "eslint-frontend-rules/no-inline-arrow-functions-in-jsx": ["warn", { "ignore": ["**/storybook/**"] }]
  }
}
```

## License

MIT
