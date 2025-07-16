import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "lib/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    exports: "auto",
    sourcemap: false,
  },
  plugins: [nodeResolve(), commonjs()],
  external: [
    "eslint",
    "micromatch",
    // Add other external dependencies if needed
  ],
};
