# Agent Guide for Income Tax Calculator

## Project Overview

This is a **Next.js 14** income tax calculator for the United States with:
- **Static Site Generation (SSG)**: Exports to static HTML/CSS/JS in `out/` directory
- **Progressive Web App (PWA)**: Installable on devices, works offline
- **Code Splitting**: Tax data is lazy-loaded per state/city to minimize bundle size
- **Precise Calculations**: Uses Dinero.js for currency math (no floating-point errors)

**Tech Stack:**
- Next.js 14 (App Router), TypeScript, Material-UI
- Testing: Playwright (e2e) + Vitest (unit)
- Deployment: Cloudflare Pages (https://income-tax.org)

## Development Workflow

### Running Locally

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server at localhost:3001
npm run go                     # Lint, build, then start production server
```

### Path Aliases

All imports use `@/` to reference `src/`, e.g., `import { CITIES } from "@/constants"`

### Environment Variables

- `.env` - Base config (app URL, repo links)

## Tax Data

All tax data used for calculations is located in [src/data](./src/data).

**File Structure:**
- `{year}/federal.ts` - Federal taxes (income, FICA, standard deductions, 401k limits)
- `{year}/state/{state}.ts` - State taxes and city-specific taxes under `[CITIES]` key

**Important:** See [src/data/README.md](./src/data/README.md) for detailed data formatting rules.

### Adding New States or Cities

1. Create/update `src/data/{year}/state/{state_name}.ts` following the format in existing files
2. Add state constant to [src/constants/states.ts](./src/constants/states.ts) if new state
3. Add city constant to [src/constants/cities.ts](./src/constants/cities.ts) if new city
4. Add tax type constants to [src/constants/tax-types.ts](./src/constants/tax-types.ts) if needed
5. Run `npm run validate-tax-data` to ensure schema compliance
6. Run tests: `npm test`

### Validating Tax Data

After updating tax data, **always** validate it with:

```bash
npm run validate-tax-data
```

This validates the schema using Joi, checking for:
- Correct bracket structure (min/max/rate or min/amount)
- Valid filing statuses
- Integer values for income thresholds
- Proper use of constants (INFINITY, snake_case names)

### Scripts & Automation

The [scripts/](./scripts/) directory contains utilities for managing the project:

- **Tax Data Management**: Validate, audit, and add state tax data
- **Dependency Updates**: Intelligently update npm packages with compatibility checks
- **Build Tools**: Generate OG images and update PWA manifest

See [scripts/README.md](./scripts/README.md) for detailed documentation on all available scripts.

## Generating OG Images

1. Run a local dev instance with `npm run dev`
2. In another terminal run `npm run generate-og-images`

`public/og-images` should be populated with screen captures for each state and city.

[get-metadata.ts](src/utils/get-metadata.ts) makes sure each page has a `<meta>` tag pointing to the matching OG image.

## API and MCP Server

`/mcp`, `/api/calculate`, `/api/target` and `/api/tax-tables` are
[Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
in [functions/](./functions/). Everything else stays static; `public/_routes.json`
limits Functions to those paths.

- Shared logic lives in [src/api/](./src/api/): Zod input schemas (no
  transforms, since they double as MCP JSON Schema), the run/serialize layer,
  the MCP server factory (`mcp-server.ts`), and `tax-tables.ts`, which labels every schedule with
  its `kind` and `basis` so a reader can tell which arithmetic applies. The
  take-home solver is
  [src/utils/target-income.ts](./src/utils/target-income.ts).
- Functions have no filesystem, so tax data is reached through
  `src/data-loaders/registry.ts`, **generated** by
  `npm run generate-tax-data-registry` (also run by `prebuild` and `predev`).
  After adding a year or state, regenerate it;
  `tests/unit/tax-data-registry.test.ts` fails if it drifts. Its `YEARS` and
  `LATEST_YEAR` are the app's list of data years everywhere, not just in
  Functions. Static pages read the full data set from disk with
  `src/data-loaders/read-from-disk.ts` (server-only); client components
  lazy-import single files through `src/hooks/use-tax-data.ts`.
- Discoverability: [/developers](./src/app/developers/page.tsx) documents the
  API (its parameter list is generated from the Zod schemas, so it stays in
  step) and is the last link, "API", in the header and footer.
  [/openapi.json](./src/app/openapi.json/route.ts) is generated from the same
  schemas at build time (`src/api/openapi.ts`), as a static file.
- Static tax tables: `postbuild` writes every table to
  `out/data/tax-tables/{year}[/{state}[/{city}]].json`
  ([scripts/generate-static-tax-tables.ts](./scripts/generate-static-tax-tables.ts)),
  which `links.tax_tables` points at. Keep them outside `/api/`: that prefix
  is routed to Functions, so static files there would cost requests.
  [public/llms.txt](./public/llms.txt) summarizes it for language models;
  update it by hand when parameters change.
- Local run: `npm run build && npm run dev:functions` (serves on :8788).
  `npm run build:functions` only bundles, as a size check.
- Free plan limits: 100k Function requests/day (static assets are free and
  unlimited) and **10 ms CPU per request**. `calculate()` is ~0.06 ms, and
  `target` runs it about 60 times, so keep the solver's evaluation count low.

## Calculator Logic

The core calculation logic is in [src/utils/calculator.ts](./src/utils/calculator.ts).

**Key Points:**
- **All currency uses Dinero.js** - Never use plain numbers for money calculations
- **FICA taxes use gross wages** — before deductions *and* before the 401(k) /
  IRA contribution. A pre-tax elective deferral reduces W-2 box 1 only; boxes 3
  and 5, the Social Security and Medicare wage figures, are unchanged by it,
  because elective deferrals remain "subject to Social Security (FICA),
  Medicare, and federal unemployment taxes"
  ([IRS Topic No. 424](https://www.irs.gov/taxtopics/tc424)). A deductible
  traditional IRA contribution is the same: a deduction on the 1040, taken out
  of wages that were already taxed for FICA. Everything in `grossIncomeTaxes`
  in [calculator.ts](./src/utils/calculator.ts) — FICA and the state
  paid-leave / disability / local payroll programs — shares that base, and so
  do flat-fee thresholds that do not declare `basis: "taxable"`.
- **Progressive brackets** are calculated separately for federal/state/city
- **Standard deductions** are applied when custom deductions aren't provided
- **Federal tax subtraction**: a state with `federal_tax_subtraction` (Oregon)
  subtracts the federal income tax, up to an AGI-phased cap, from state
  taxable income — on top of the deduction, and carried into city taxes on
  state taxable income. See [src/data/README.md](./src/data/README.md).
- **Sales tax** is separate data, in `src/data/{year}/sales-tax/`, used by
  the comparison page ([sales-tax.ts](./src/utils/sales-tax.ts)) and the tax
  tables (page, API and static JSON), never by `calculate()`. Its cities, like
  Seattle, get tax-table pages but no calculator pages. The registry carries
  the files for Functions. See
  [src/data/README.md](./src/data/README.md#sales-tax).
- **Personal exemption credit**: a state with `personal_exemption_credit`
  (Oregon) takes a nonrefundable credit off its own income tax only. New
  config keys like these belong in `NON_TAX_DATA_KEYS` in
  [tax-types.ts](./src/constants/tax-types.ts), which keeps them out of every
  list of taxes.

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit              # Run once
npm run test:unit:watch        # Watch mode
npm run test:unit:ui           # Interactive UI
```

See [tests/unit/README.md](./tests/unit/README.md) for details on unit test structure.

### E2E Tests (Playwright)

```bash
npm run test:e2e               # Run all e2e tests
npm run test:e2e:ui            # Interactive UI mode
```

**Important:** E2E tests run against `localhost:3001` in test mode.

Specs live in `tests/e2e/`. See [tests/README.md](./tests/README.md) for test patterns and examples.

## Build & Deployment

### Local Build

```bash
npm run build                  # Builds static site to out/
npm run start                  # Serves out/ directory
```

**Post-build:**
- Generates sitemap with `next-sitemap`
- Updates PWA manifest with [scripts/update-manifest.js](./scripts/update-manifest.js)

### CI/CD (GitHub Actions)

Two workflows run on push/PR:

1. **[lint-build-test.yml](./.github/workflows/lint-build-test.yml)**
   - Lints (Next.js auto-lints during build)
   - Builds for test environment
   - Runs Playwright e2e tests

2. **[validate-tax-data.yml](./.github/workflows/validate-tax-data.yml)**
   - Validates all tax data schema

### Pre-commit Hooks

Husky runs `npm run lint` before every commit to ensure code quality.

### Cloudflare Pages

Deployed to https://income-tax.org

- Build command: `npm run build`
- Output directory: `out`
- Security headers come from [public/\_headers](./public/_headers), which
  Cloudflare Pages reads from the output directory
- `404.html` is served automatically for unmatched paths; no rule needed
- Trailing slashes are produced by `trailingSlash: true` in
  [next.config.mjs](./next.config.mjs)

The www → non-www redirect is **not** in the repo. Cloudflare Pages'
`_redirects` matches paths only, not hostnames, so that rule lives in the
Cloudflare dashboard as a Redirect Rule.

## Standards

### Naming Conventions

- **URLs and files**: dash-case, e.g., `/tax-tables/2025/missouri/kansas-city/?tables=city-income`
  - Exception: tax data files, `src/data/{year}/state/{state}.ts`, are
    snake_case on purpose. The filename is the state key (`new_jersey`), which
    matches the state constant and the generated registry imports.
- **React hooks**: in [src/hooks/](./src/hooks/), named `use-*.ts`; pure
  helpers stay in [src/utils/](./src/utils/)
- **Constants and code**: snake_case, e.g., `kansas_city`, `city_income`
- **Components**: PascalCase
- **Functions/variables**: camelCase

### Code Quality

- Use `npm run lint` to check for issues
- Use `npm run lint:fix` to auto-fix formatting
- All constants should be defined in [src/constants/](./src/constants/), never use string literals
- Import from constants: `import { SINGLE } from "@/constants/filing-status"`

### Testing Standards

- See [tests/](./tests/README.md) for e2e tests
- See [tests/unit](./tests/unit/README.md) for unit tests
- Always test tax calculations with real scenarios
- Use Dinero's `.equalsTo()` for currency comparisons in tests