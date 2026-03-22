//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/order": "off",
      "simple-import-sort/imports": "off",
      "simple-import-sort/exports": "off",
    },
  },
]
