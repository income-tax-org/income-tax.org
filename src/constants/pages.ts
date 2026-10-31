// No trailing slash. For absolute URLs shown to readers, such as API examples.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://income-tax.org"
).replace(/\/$/, "");

export const INCOME_TAX_CALCULATOR = {
  name: "Income Tax Calculator",
  route: "/",
};
export const TAX_TABLES = {
  name: "Income Tax Tables",
  route: "/tax-tables",
};
export const CITY_TAXES = {
  name: "Cities With Income Taxes",
  route: "/city-taxes",
};
export const COMPARE = {
  name: "Compare Places",
  route: "/compare",
};
export const SUPPORT = {
  name: "Support",
  route: "/support",
};
export const DISCLAIMER = {
  name: "Disclaimer",
  route: "/disclaimer",
};
// Linked from the footer only, not the header navigation.
export const PRIVACY = {
  name: "Privacy",
  route: "/privacy",
};

// Shown as link text such as "email us", never as the bare address.
export const CONTACT_EMAIL = "evan.a.b.projects+ic@gmail.com";

export const INCOME_TAX_CALCULATOR_SHORT_TITLE = "Calculator";

export const TAX_TABLES_SHORT_TITLE = "Tax Tables";

export const CITY_TAXES_SHORT_TITLE = "City Taxes";

export const COMPARE_SHORT_TITLE = "Compare";

// Documents the JSON API and MCP server for developers and AI assistants.
// Not `/api`, which _routes.json sends to Pages Functions.
export const DEVELOPERS = {
  name: "API & MCP",
  route: "/developers",
};

export const DEVELOPERS_SHORT_TITLE = "API";
