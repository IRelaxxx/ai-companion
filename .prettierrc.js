module.exports = {
  importOrder: ["^[./]", "^@/(.*)$"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  printWidth: 80,
  tabWidth: 4,
  trailingComma: "all",
  singleQuote: true,
  semi: true,

  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
