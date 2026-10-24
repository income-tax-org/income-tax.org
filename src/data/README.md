# Data

All tax bracket data is organized by TypeScript files that each export a default object:

- `{year}/federal.ts` - Values for each tax (e.g. income, medicare, social security) by filing status for the `{year}`

- `{year}/state/{state}.ts` - Values for each `{state}` level tax by filing status for the `{year}`. Any city-specific taxes are under the `[CITIES]` key.

For a complete example including state income tax, standard deductions, payroll taxes, and city-specific taxes, see [2025/state/oregon.ts](./2025/state/oregon.ts).

## Rate

`rate` is expressed as a percentage,

Examples:

- 0.58% = `rate: 0.58`
- 1.25% = `rate: 1.25`
- 13% = `rate: 13`

## Naming

Make sure to use `snake_case` for all state, city, and tax names.

Rather than adding string literals for city & tax names, add and reference a constant variable in the relevant [constants](../constants/) file.

- City names go in [cities.ts](../constants/cities.ts)

- Tax type names go in [tax-types.ts](../constants/tax_types.ts)

## File organization

The default object in each file is organized in the following format:

```typescript
import type { TaxData } from "@/types";

export default {
  "tax type": {
    "filing status": [
      { min: number, max: number, rate: number }  // Progressive tax brackets
      ||
      { min: number, amount: number }              // Flat fee (e.g., min: 1000, amount: 35)
      ||
      { ..., percent_of_total: number }            // Employee portion (e.g., 60 = 60% employee, 40% employer)
      ...
    ]
  }
} as TaxData;
```

**Filing Status:**

- Use specific filing statuses ([SINGLE, MARRIED, etc.](../constants/filing_status.ts)) for taxes that vary by status
- Use `ALL` for taxes applied the same way regardless of filing status (e.g., payroll taxes)

**Special Formats:**

- **Standard deductions**: Single number per filing status, not brackets (e.g., `[SINGLE]: 2835`) — or, for the states that shrink it as income rises, a schedule of bands. See [Standard deductions that phase out](#standard-deductions-that-phase-out).
- **INFINITY constant**: Use for the max of the highest bracket (e.g., `{ min: 250000, max: INFINITY, rate: 9.9 }`)
- **City taxes**: Nested under `[CITIES]: { [CITY_NAME]: { ... } }`

## Rate brackets must be contiguous

One bracket's `max` is the next bracket's `min` — the same number, written twice:

```typescript
{ min: 0,    max: 5500,  rate: 0 },
{ min: 5500, max: 10900, rate: 2 },   // not min: 5501, and not a previous max of 5499
```

A bracket is the range _above_ its `min` up to and including its `max`. Writing
`max: 5499` next to `min: 5500` leaves a dollar taxed at no rate, and the tax
tables render bracket floors from this convention, so mixing the two styles
makes the displayed range wrong too. `npm run validate-tax-data` enforces this.

Every filing status a tax defines must define all four — a partial set means the
calculator is handed `undefined` for the missing ones. Use `[ALL]` when the tax
does not vary by status.

## Rate lookups

Most rate schedules are marginal: each bracket taxes the slice of income between
its `min` and `max`. A few taxes instead use their bands to _pick_ a rate, which
is then charged on the whole base. Those set `rate_on_total` on every bracket:

```typescript
{ min: 0,     max: 32344,    rate: 0,    rate_on_total: true },
{ min: 32344, max: INFINITY, rate: 0.44, rate_on_total: true },   // 0.44% of everything
```

At $100,000 that is $440, not the $302.26 a marginal reading gives. Eugene's
community safety payroll tax is the only one so far; the City's published rate
chart states the rule outright — its purpose is "to obtain the rate to be
applied to all subject wages paid in a pay period."

Note the cliff this creates at the threshold, which is real: a dollar more in
wages turns $0 into $142.31.

Two jurisdictions need this so far, so it is a recurring shape rather than a
one-off: Eugene's community safety payroll tax, and Frederick County, Maryland,
whose local tax Form 502 Worksheet 19A computes by "multiply the taxable net
income by your local tax rate" — with no "plus $X" base amount of the kind
Anne Arundel's schedule carries.

## Which income a rate is charged on

By default the income base comes from the tax type — `grossIncomeTaxes` in
`utils/calculator.ts` lists the ones computed on wages (FICA, the state
paid-leave programs, the local occupational and payroll taxes); everything else
is computed on income after deductions.

**"Gross" means true wages: before deductions _and_ before any pre-tax
retirement contribution.** A 401(k) elective deferral reduces W-2 box 1 only —
boxes 3 and 5, the Social Security and Medicare wage figures, are unchanged by
it, because elective deferrals stay "subject to Social Security (FICA),
Medicare, and federal unemployment taxes" (IRS Topic No. 424). A deductible
traditional IRA contribution is a deduction on the 1040, taken out of wages that
were already taxed for FICA. So the 401(k) / IRA figure the calculator collects
belongs in the taxable-income line and nowhere else.

Where the tax type alone does not settle it, a schedule says so with `basis`.
`city_income` is the case that needs it, because that one key covers three
different bases:

- `"gross"` — the Kansas City and St. Louis earnings taxes on "salaries, wages,
  commissions and other compensation" (RSMo 92.111), Wilmington's on "the total
  income from whatever source earned" (22 Del. C. 903), and Ohio's municipal
  taxes on "qualifying wages" as defined by IRC 3121(a) (ORC 718.01(R)).
- `"taxable"` — the default, correct for a city or county tax that genuinely
  starts from state taxable income, as Maryland's counties and Indiana's do.
- `"state_income_tax"` — charged on the state's computed tax rather than on any
  income figure. Yonkers' resident surcharge is 16.75% of New York State tax
  (IT-201 line 55), not a rate on income.

That last one exists to stop the state's schedule being copied into a second
place. Multiplying New York's nine brackets by 0.1675 is exact for a filer with
no credits, and it would go stale the next time New York changes a rate. Only a
city rate schedule may declare it, it must be a single bracket spanning 0 to
`INFINITY`, and `npm run validate-tax-data` enforces both.

`rate_on_total` and `basis` describe the whole schedule but are written per
bracket, and the calculator reads them off the first one. `npm run
validate-tax-data` rejects a schedule that sets either on only some brackets.

## Flat fees

A fixed-dollar tax uses `amount` instead of `rate`:

```typescript
{ min: 6000, amount: 5.75, frequency: "monthly" }   // Denver: $5.75/mo above $6,000
```

- `min` is **inclusive** — income _at_ the threshold owes the fee.
- `frequency` annualizes the amount (`weekly`, `biweekly`, `semi_monthly`,
  `monthly`, `annually`). Omit it for a fee that is already annual.
- `basis` picks which income figure the threshold is measured against:
  `"gross"` (the default — true wages, before deductions and before any
  retirement contribution, the same figure the gross-basis rate schedules use)
  or `"taxable"` (after both). Most thresholds are written against gross wages;
  Portland's 2026 Arts Tax is the exception and tests Oregon taxable income, so
  it sets `basis: TAXABLE_INCOME_BASIS`.
- `amount` must land on a whole cent.

Where a schedule lists several tiers, the highest one the taxpayer qualifies for
applies; fees are not cumulative. The tier is chosen by its `min`, not by its
position in the array, so the order tiers are written in does not change the
fee.

## Standard deductions that phase out

### What the slot actually holds

`standard_deduction` holds **whatever the state subtracts from income before
applying its rate**, not literally a thing called a standard deduction. Some
states call it a personal exemption instead — Connecticut's figures in this
slot are its personal exemption, and Illinois, New Jersey and Ohio have
exemption allowances of the same kind. They belong here: the calculator's
question is what gets subtracted, and a filer does not care what the form calls
it. A state that has both would carry their sum, with a comment saying so.

### Deductions that vary with income

Most states allow the same standard deduction at every income, and those are one
number per filing status. Five — Alabama, Connecticut, Maine, Montana and
Wisconsin — shrink it as income rises, and one number cannot say that. Storing
only the maximum over-deducts for most filers in those states: Alabama's joint
deduction is $8,500 at the bottom of the range and $5,000 for anyone above about
$35,500, and it is the $5,000 that ADOR's own withholding example uses.

Those statuses take an array of bands instead:

```typescript
[STANDARD_DEDUCTION]: {
  [SINGLE]: [
    { min: 0,      max: 19550,    amount: 13560 },
    { min: 19550,  max: 132550,   amount: 13560, reduce_rate: 12 },
    { min: 132550, max: INFINITY, amount: 0 },
  ],
  [MARRIED]: 25110,   // a flat status can sit next to a banded one
  ...
}
```

- `min` / `max` bound the income the band applies to. Bands are **half-open**,
  `[min, max)`, and contiguous, so one band's `max` is the next one's `min`.
  Note this differs from the rate-bracket convention above: a schedule printed
  as "over $19,549 but not over $132,549" becomes `min: 19550, max: 132550`,
  one dollar up on both ends.
- `amount` is the deduction before this band's reduction.
- `reduce_rate` takes a percentage of the income above `reduce_from`. Use it
  where the state publishes a rate ("$13,560 less 12%").
- `reduce_per` and `reduce_by` take a fixed amount for each whole step. Use them
  where the state publishes a chart of increments ("$175 for each $500"). A band
  uses one form or the other, never both.
- `reduce_from` is the income the reduction is measured from, defaulting to
  `min`. Set it only where the published schedule measures from somewhere else.
- `percent_of_income` makes the deduction a straight percentage of income
  instead, clamped into `[floor, amount]` — a schedule that *rises* to a cap
  rather than phasing out. Montana through tax year 2023: "20% of Montana AGI",
  floored at $2,460 and capped at $5,540. Cannot be combined with the reduce
  fields.
- `floor` is the least the band allows. Defaults to 0. Alabama floors at
  $5,000.

A band needs none of the reduce fields, which is how a **cliff** is written — a
deduction allowed in full up to a threshold and not at all above it. Illinois
disallows its exemption allowance entirely above $250,000 of base income ("you
are not entitled to an exemption allowance on Line 10. Enter 'zero'"):

```typescript
[SINGLE]: [
  { min: 0,       max: 250000,   amount: 2850 },
  { min: 250000,  max: INFINITY, amount: 0 },
],
```

A cliff and a taper share a representation but are different things, so it is
worth knowing the cliff is expressible before going looking for a field to
express it with.

The first band must start at 0 and the last must end at `INFINITY`, so every
income lands in exactly one. `npm run validate-tax-data` enforces that, along
with contiguity and the rule that a schedule moves in one direction only — a
deduction that both rises and falls means a band is transcribed wrong.

### Which income the band is chosen by

Income after retirement contributions, before the deduction itself — the same
figure that feeds taxable income. That is a **proxy for AGI**, which is what
these states actually key on; the two differ by above-the-line items this
calculator does not model. It is deliberately not the gross wage figure that
FICA uses, which ignores the retirement contribution.

### Transcribing one

Work from the schedule the state publishes as a formula, not from a lookup table
if it prints both — Wisconsin's Form 1 table is 274 rows per year. Each band
should be one printed row, so a reviewer can hold the file next to the source.

Wisconsin's head of household is the awkward case worth knowing about: it falls
at 22.515% until it meets the single taxpayer's schedule, then continues on that
schedule — and the DOR keeps measuring that second stage from the *first*
threshold. That is what `reduce_from` exists for. See
[2025/state/wisconsin.ts](./2025/state/wisconsin.ts) for the worked example.

A state that publishes both a formula and a stepped table will not agree with
itself exactly: the table is the formula evaluated at each step's midpoint. The
calculator evaluates at the filer's own income, so it can sit up to half a step
from the printed table — a couple of dollars of tax.

## Federal tax subtraction

`federal_tax_subtraction` is for a state that lets filers subtract the federal
income tax they owe before its own rates apply. Oregon is the only one so far
(Form OR-40 line 10). It holds the **cap**, not the subtraction: the calculator
subtracts the smaller of the cap and the federal income tax it computed —
federal tax after nonrefundable credits, Form 1040 line 22, never FICA.

The shape is the standard deduction's: a number per filing status, or bands
chosen by the same AGI proxy. Oregon prints its cap as a stepped table, "at
least / but less than", which is the half-open band convention exactly, so each
printed row is one band with no reduce fields:

```typescript
[FEDERAL_TAX_SUBTRACTION]: {
  [SINGLE]: [
    { min: 0,      max: 125000,   amount: 8500 },
    { min: 125000, max: 130000,   amount: 6800 },
    ...
    { min: 145000, max: INFINITY, amount: 0 },
  ],
  ...
}
```

Transcribe the steps as printed rather than computing them from the cap: in 2023
Oregon rounded them, so the second step is 6,250, not 80% of 7,800. It is a
subtraction, not a deduction, so it applies on top of a custom deduction the
user enters, and city taxes that start from state taxable income see it.

## Personal exemption credit

`personal_exemption_credit` is a nonrefundable credit taken off the state's
computed income tax — not off income, and not off payroll or local taxes. That
is what separates it from the personal *exemptions* above, which reduce income
and live in `standard_deduction`. Oregon's is the only one so far (Form OR-40
line 25).

Same shape again: an amount per filing status, or bands chosen by the AGI
proxy. Hold the **total** for the filer: one exemption, two for a joint return.
Dependents would add one each, but the calculator does not model them. Oregon's
credit stops entirely once federal AGI is "more than $100,000" ($200,000 for
joint and head of household), so it is a cliff — and because the limit itself
still qualifies, the zero band starts one dollar up:

```typescript
[PERSONAL_EXEMPTION_CREDIT]: {
  [SINGLE]: [
    { min: 0,      max: 100001,   amount: 256 },
    { min: 100001, max: INFINITY, amount: 0 },
  ],
  [MARRIED]: [
    { min: 0,      max: 200001,   amount: 512 },
    { min: 200001, max: INFINITY, amount: 0 },
  ],
  ...
}
```

A cliff makes the marginal rate meaningless across it — one dollar over the
limit costs the whole credit — which the marginal-rate display flags as
spanning a rate change.

For example a `federal.ts` file might contain part of this object,

```js
import { INFINITY } from "@/constants";
import { SINGLE } from "@/constants/filing_status";
import { INCOME } from "@/constants/tax_types";

export default {
  [INCOME]: {
    [SINGLE]: [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 578125, rate: 35 },
      { min: 578125, max: INFINITY, rate: 37 },
    ],
  },
};
```

## Sales tax

Sales tax lives apart from the income tax data, in
`{year}/sales-tax/`, because it is charged on spending rather than income.
The income calculator never reads it. Only the comparison page does, to rank
locations on take-home pay less the sales tax on a year's taxable spending.

- `sales-tax/state/{state}.ts` — the state's rate, a fallback local rate for
  a location with no city picked, and each listed city's own local rate under
  `[CITIES]`. A city not listed falls back too.
- `sales-tax/taxable-spending.ts` — the IRS table the default spending figure
  is derived from.

A state with no file has **no data**, which is different from no sales tax:
Oregon has a file of zeros, and the comparison flags any state without one
rather than charging it nothing silently.

```typescript
export default {
  [STATE_SALES_TAX]: 6.5,
  [LOCAL_SALES_TAX]: [3.01, 3.01, 3.07, 3.07], // no city picked
  [CITIES]: {
    [SEATTLE]: { [LOCAL_SALES_TAX]: 4.05 },              // all year
    [TACOMA]: { [LOCAL_SALES_TAX]: [3.8, 3.9, 4, 4] },   // by quarter
  },
} as SalesTaxData;
```

- Rates are percentages, like every other rate here.
- A rate that changed during the year is written as four quarterly rates, Q1
  to Q4; one that did not is a single number. `npm run validate-tax-data`
  rejects four equal quarters. Washington lets a local change take effect
  only at the start of a quarter (RCW 82.14.055), and the calculator weights
  each quarter by its days.
- Washington's figures come from the Department of Revenue's quarterly
  `Rates_YYQn.csv` downloads. Each city carries a comment with the DOR
  location code it was read from. Where DOR splits a city by Sound Transit's
  district or by county, use the code covering most residents.
- The fallback local rate is the Tax Foundation's population-weighted average,
  which is published each January and July.

### Default taxable spending

The IRS Optional State Sales Tax Table (Schedule A instructions) gives the
sales tax a household is estimated to pay, by income and family size. Divide
it by the rate it was computed at and you get the taxable spending behind it.
That is the default the user can override. Transcribe the rows as printed.
They read "at least / but less than", so bands are half-open, `[min, max)`.

## Contributing

When adding a new state or city:

1. Create/update the state file: `{year}/state/{state_name}.ts`
2. Add constants to:
   - [states.ts](../constants/states.ts) - if adding a new state
   - [cities.ts](../constants/cities.ts) - if adding a new city
   - [tax_types.ts](../constants/tax_types.ts) - if adding a new tax type
3. Validate: `npm run validate-tax-data`
4. Test: `npm test`

## Why

We split the files up like this for [code splitting](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#nextdynamic) so that the entire JSON database of brackets isn't sent to the user when they load the page. Instead the client will fetch the necessary files as needed based on the user's selection.
