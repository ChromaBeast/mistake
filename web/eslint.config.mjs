import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
      "test/**",
      "edit.js",
    ],
  },
  ...next,
  {
    rules: {
      // Mount-time reads of localStorage/theme DOM state and dialog state
      // resets on open are deliberate single-render syncs, not cascades.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
