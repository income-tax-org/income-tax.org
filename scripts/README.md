# Scripts Directory

This directory contains utility scripts for managing the Income Tax Calculator project. All scripts are designed to automate common tasks and maintain data quality.

## Table of Contents

- [Tax Data Management](#tax-data-management)
  - [validate-tax-data.ts](#validate-tax-datats)
  - [audit-state-tax-data.sh](#audit-state-tax-datash)
  - [audit-additional-taxes.sh](#audit-additional-taxessh)
  - [add-remaining-states.sh](#add-remaining-statessh)
- [Build & Deployment](#build--deployment)
  - [generate-og-images.ts](#generate-og-imagests)
  - [update-manifest.js](#update-manifestjs)
  - [open-browser.js](#open-browserjs)

---

## Tax Data Management

### validate-tax-data.ts

**TypeScript script** that validates all tax data files against a Joi schema to ensure data integrity.

**Usage:**
```bash
npm run validate-tax-data
```

**What it does:**
- Validates bracket structure (min/max/rate or min/amount)
- Checks for valid filing statuses
- Ensures integer values for income thresholds
- Verifies proper use of constants (INFINITY, snake_case names)
- Validates against the schema defined in the script

**When to use:**
- After adding or modifying any tax data files
- Before committing tax data changes
- As part of CI/CD validation (runs in GitHub Actions)

**Exit codes:**
- `0` - All validation passed
- `1` - Validation errors found

---

### audit-state-tax-data.sh

**Bash script** that uses GitHub Copilot CLI to verify and correct state income tax brackets.

**Usage:**
```bash
./scripts/audit-state-tax-data.sh -y 2025
```

**Options:**
- `-y YEAR` - Specify the tax year (e.g., 2025)

**What it does:**
- Processes states in batches
- Uses Copilot CLI to research current tax brackets
- Verifies data accuracy against official sources
- Updates files with corrections
- Logs all changes to `logs/audit-states-{YEAR}-{TIMESTAMP}.log`

**When to use:**
- When tax brackets change for a new year
- To verify existing data accuracy
- After initial data entry to double-check values

---

### audit-additional-taxes.sh

**Bash script** that identifies and adds missing state-wide or city-specific taxes.

**Usage:**
```bash
./scripts/audit-additional-taxes.sh -y 2025
```

**Options:**
- `-y YEAR` - Specify the tax year (e.g., 2025)

**What it does:**
- Checks each state for additional taxes beyond income tax
- Identifies city-specific taxes (e.g., Kansas City earnings tax)
- Uses Copilot CLI to research and add missing tax data
- Logs findings to `logs/audit-additional-taxes-{YEAR}-{TIMESTAMP}.log`

**When to use:**
- After adding state income tax data
- When expanding coverage to new cities
- To ensure comprehensive tax calculations

---

### add-remaining-states.sh

**Bash script** that automates adding state tax data for all 50 states + DC.

**Usage:**
```bash
./scripts/add-remaining-states.sh -y 2025
```

**Options:**
- `-y YEAR` - Specify the tax year (e.g., 2025)

**What it does:**
- Identifies states without data files for the specified year
- Processes missing states in batches of 5
- Uses Copilot CLI to research and create TypeScript files
- Validates created files with `npm run validate-tax-data`
- Logs progress to `logs/add-states-{YEAR}-{TIMESTAMP}.log`

**When to use:**
- When starting data for a new tax year
- To fill in missing states
- Bulk data creation

---

## Build & Deployment

### generate-og-images.ts

**TypeScript script** that generates Open Graph images for all states and cities.

**Usage:**
```bash
# First, start dev server in one terminal
npm run dev

# Then in another terminal, run:
npm run generate-og-images
```

**What it does:**
- Captures screenshots of each state/city page
- Saves to `public/og-images/` directory
- Used by `get-metadata.ts` to add OG meta tags
- Improves social media sharing appearance

**Requirements:**
- Dev server must be running on `localhost:3001`
- Playwright browser binaries installed

**When to use:**
- After adding new states or cities
- When UI changes affect page appearance
- Before major releases

**Output:**
- `public/og-images/landing.png`
- `public/og-images/{state-name}.png`
- `public/og-images/{state-name}/{city-name}.png`

---

### update-manifest.js

**Node.js script** that updates the PWA manifest for deployment.

**Usage:**
```bash
# Runs automatically after build
npm run build
```

**What it does:**
- Reads `public/manifest.webmanifest`
- Updates scope and start_url to `/`
- Ensures icon paths are root-relative
- Writes to `out/manifest.webmanifest` for static deployment

**When to use:**
- Runs automatically as part of `postbuild` script
- No manual invocation needed

**Note:** This is necessary for static site deployment where the app is served from the root path.

---

### open-browser.js

**Node.js script** that opens `http://localhost:{port}` in the default browser.

**Usage:**
```bash
node scripts/open-browser.js 3001
```

Called by `npm run dev` and `npm run go`; no manual invocation needed.

---

## Development Workflow

### Adding New Tax Data

1. Create/update data files in `src/data/{year}/state/`
2. Run `npm run validate-tax-data` to verify schema
3. Run `./scripts/audit-state-tax-data.sh -y {year}` to verify accuracy
4. Run `./scripts/audit-additional-taxes.sh -y {year}` to check for missing taxes
5. Run tests: `npm test`

### Updating Dependencies

1. Run `npm run update-dependencies -- --group-only` to see what needs updating
2. Run `npm run update-dependencies` for interactive update process
3. Review changes: `git diff`
4. Test manually: `npm run dev`
5. Commit changes

### Before Deployment

1. Validate all tax data: `npm run validate-tax-data`
2. Run all tests: `npm test`
3. Build: `npm run build`
4. Generate OG images: `npm run generate-og-images` (with dev server running)

---

## Logging

All scripts create timestamped log files in the `logs/` directory:

- `update-deps-{TIMESTAMP}.log` - Dependency updates
- `add-states-{YEAR}-{TIMESTAMP}.log` - State data additions
- `audit-states-{YEAR}-{TIMESTAMP}.log` - State data audits
- `audit-additional-taxes-{YEAR}-{TIMESTAMP}.log` - Additional tax audits

Logs are useful for:
- Debugging script failures
- Reviewing what changed
- Auditing data modifications
- Understanding Copilot CLI decisions

---

## Requirements

### All Scripts
- Node.js >= 20.0.0
- npm

### Bash Scripts
- Bash shell (macOS/Linux)
- GitHub Copilot CLI installed and authenticated

### TypeScript Scripts
- Dependencies installed: `npm install`
- TypeScript and ts-node (included in devDependencies)

---

## Troubleshooting

### "Copilot CLI not found"
Install GitHub Copilot CLI:
```bash
npm install -g @githubnext/github-copilot-cli
```

### "Validation failed"
Run `npm run validate-tax-data` to see specific errors. Common issues:
- Missing required fields
- Non-integer income thresholds
- Invalid filing statuses
- Incorrect bracket structure

### "Dependency update failed"
Check the log file for details. Common issues:
- Peer dependency conflicts
- Breaking changes requiring code updates
- Test failures

### "OG images not generated"
Ensure:
- Dev server is running: `npm run dev`
- Playwright is installed: `npx playwright install`
- No other process is using port 3001

---

## Contributing

When adding new scripts:

1. Add clear usage documentation to this README
2. Include a help message in the script (`--help` flag)
3. Create timestamped logs in the `logs/` directory
4. Add error handling and validation
5. Test thoroughly before committing
6. Update AGENTS.md if the script is relevant for AI agents
