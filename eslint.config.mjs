import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  allConfig: {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Optionally, you can set the severity for specific rules here
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Ensure 'any' isn't warned
    },
  },
];

export default eslintConfig;
