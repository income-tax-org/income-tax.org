# 2026 Tax Data — Sourcing Status

Source-of-truth tracker for the 2026 tax-year data build. Records what has
been populated, what source each figure came from, and anything **unsourced or
not yet finalized** by the taxing authority. Update this file as data lands.

Last updated: 2026-10-30 (third sweep — every provisional, carried or derived 2026 figure re-checked against the newest official documents; see [Third sweep](#third-sweep-2026-10-30))

## How to read this

- **Status** — `done` (populated + sourced), `partial` (populated but some
  figures provisional/estimated), `missing` (file not yet created), `no-tax`
  (state has no wage income tax; file is a trivial `NONE` copy of 2025).
- **Flag anything provisional here.** If a state's 2026 brackets weren't
  published yet and 2025 values were carried forward, say so in Notes with an
  explicit `CARRIED FROM 2025` marker so it can be revisited.

## Federal — `src/data/2026/federal.ts`

**Status: done.** TY2026 figures per IRS Rev. Proc. 2025-32 (reflecting the
One Big Beautiful Bill Act), IRS Notice 2025-67 (retirement limits), and the
SSA 2026 wage-base announcement.

| Item                           | 2026 value           | Source                          |
| ------------------------------ | -------------------- | ------------------------------- |
| Standard deduction (S / MFS)   | $16,100              | IRS Rev. Proc. 2025-32          |
| Standard deduction (MFJ)       | $32,200              | IRS Rev. Proc. 2025-32          |
| Standard deduction (HoH)       | $24,150              | IRS Rev. Proc. 2025-32          |
| Income brackets (all statuses) | see file             | Tax Foundation 2026 table / IRS |
| Social Security wage base      | $184,500 @ 6.2%      | SSA 2026 announcement           |
| Medicare thresholds            | statutory, unchanged | IRC §3101 (not indexed)         |
| 401(k) elective deferral limit | $24,500              | IRS Notice 2025-67              |

**Note on Married Filing Separately:** MFS brackets follow the statutory
MFJ/2 rule (IRC §1), so the 35% cap is $384,350, not the single-filer
$640,600. This matches the repo's 2025 precedent. Web tables often mis-state
MFS by copying single-filer thresholds — do not.

## Sales tax — `src/data/2026/sales-tax/`

**Status: done for every state and DC**, 2025 and 2026: 792 cities, about 20
of the largest per state. States with no general local tax list no cities.
Each file's header names its sources (state revenue department rate tables
and download files first). Figures were gathered by one agent per batch of
states and spot-checked by a second agent against a different source.

| Item                     | Status          | Notes                                                                                                                                              |
| ------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| State and city rates     | done            | through Q4 2026                                                                                                                                    |
| No-city fallback         | done            | Tax Foundation average local rate, Jan and Jul                                                                                                     |
| Default taxable spending | **provisional** | CARRIED FROM 2025: IRS 2025 Optional Sales Tax Tables. Checked 2026-10-30: no 2026 Schedule A instructions, not even a draft                       |
| Arizona, December 2026   | **provisional** | ADOR's December table still unpublished 2026-10-30; November rates assumed to hold. ADOR's December change list has only a Camp Verde lodging rate |
| Nevada                   | done            | no rate document dated 2026; no change notices found, rates unchanged since 2020                                                                   |
| District of Columbia     | done            | 6% all of 2025-2026; the increases to 6.5% and 7% were both postponed (OTR notice)                                                                 |

## States (50 + DC)

All 51 files present and the repo validator (`npm run validate-tax-data`)
passes. 50 states were drafted by the Sonnet fan-out; Oregon pre-existed.
**8 files carry at least one provisional figure** as of 2026-10-30 (arizona, arkansas, idaho, indiana, oregon, vermont, washington, and alabama's survey-only small towns) — see [Third sweep](#third-sweep-2026-10-30).

| State                | Status          | Notes                                                                                                                                                                                                    |
| -------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| alabama              | done            | rates + brackets unchanged; SD & city occupational rates confirmed                                                                                                                                       |
| alaska               | no-tax          | NONE                                                                                                                                                                                                     |
| arizona              | **provisional** | flat 2.5%; SD = federal 2026 amounts, ADOR figure unpublished (checked 2026-10-30) though Laws 2026 Ch. 140 indexes it like the federal one                                                              |
| arkansas             | **provisional** | top rate 3.7% (Act 1, 2026 1st Ex. Sess.); SD $2,470 from withholding / 2026 AR1000ES only — 2026 AR1000F instructions unpublished (checked 2026-10-30)                                                  |
| california           | done            | brackets + SD from FTB 2026 Tax Rate Schedules and Tax News Oct 2026 (2026-10-30; were carried from 2025); SDI 1.3%; 1% surcharge over $1M                                                               |
| colorado             | done            | flat 4.4%; OPT city rates carried (municipality-set)                                                                                                                                                     |
| connecticut          | done            | 2026 Tables A and B in CT-1040ES (Rev. 01/26) match the file exactly; no 2026-session change (OLR 2026-R-0076) — checked 2026-10-30                                                                      |
| delaware             | done            | brackets/SD unchanged; Wilmington wage tax corrected 1.5%→1.25% (2025 file was wrong)                                                                                                                    |
| district_of_columbia | done            | brackets/SD unchanged; PFL 0.75% confirmed                                                                                                                                                               |
| florida              | no-tax          | NONE                                                                                                                                                                                                     |
| georgia              | done            | HB 463: flat rate 5.19%→4.99%, SD raised (retroactive to 2026-01-01)                                                                                                                                     |
| hawaii               | done            | Act 46 SD phase-in; brackets confirmed                                                                                                                                                                   |
| idaho                | **provisional** | 5.3% confirmed (EPB00744); zero-rate bracket top CARRIED FROM 2025 — 2026 figure unpublished (checked 2026-10-30)                                                                                        |
| illinois             | done            | flat rate                                                                                                                                                                                                |
| indiana              | **provisional** | 92 county rates from DN #1 (no 2026 CT-40 yet); Boone changed Oct. 1, 2026 (DN #1 R47) and needs CT-40's blend                                                                                           |
| iowa                 | done            |                                                                                                                                                                                                          |
| kansas               | done            |                                                                                                                                                                                                          |
| kentucky             | done            | flat rate                                                                                                                                                                                                |
| louisiana            | done            |                                                                                                                                                                                                          |
| maine                | done            |                                                                                                                                                                                                          |
| maryland             | done            |                                                                                                                                                                                                          |
| massachusetts        | done            |                                                                                                                                                                                                          |
| michigan             | done            | flat rate                                                                                                                                                                                                |
| minnesota            | done            |                                                                                                                                                                                                          |
| mississippi          | done            |                                                                                                                                                                                                          |
| missouri             | done            |                                                                                                                                                                                                          |
| montana              | done            |                                                                                                                                                                                                          |
| nebraska             | done            | LB754 rate cut to 4.55% confirmed; HOH SD $12,950 now printed by DOR in the 2026 1040N-ES (2026-10-30), matching the derived value                                                                       |
| nevada               | no-tax          | NONE                                                                                                                                                                                                     |
| new_hampshire        | no-tax          | interest/dividends structure retained                                                                                                                                                                    |
| new_jersey           | done            |                                                                                                                                                                                                          |
| new_mexico           | done            |                                                                                                                                                                                                          |
| new_york             | done            |                                                                                                                                                                                                          |
| north_carolina       | done            | flat rate                                                                                                                                                                                                |
| north_dakota         | done            |                                                                                                                                                                                                          |
| ohio                 | done            |                                                                                                                                                                                                          |
| oklahoma             | done            |                                                                                                                                                                                                          |
| oregon               | **provisional** | brackets, single/joint SD, transit, PFML, local layer sourced; HOH SD, MFS federal-tax-subtraction cap and $263 exemption credit await the 2026 OR-40 instructions (checked 2026-10-30)                  |
| pennsylvania         | done            | flat 3.07%; all 14 municipal rates verified against the DCED register 2026-09-07 (3 corrected); Philadelphia carries the start-of-year 3.74% per the repo convention (3.735% from 2026-07-01, phila.gov) |
| rhode_island         | done            | SD + exemption, phase-out and brackets from ADV 2025-22 (re-verified 2026-10-30); TDI 1.1% to $100,000                                                                                                   |
| south_carolina       | done            | Act 110 of 2026: 1.99% / 5.21% − $966 and the phasing SCIAD, per SC IL #26-20 (re-verified 2026-10-30)                                                                                                   |
| south_dakota         | no-tax          | NONE                                                                                                                                                                                                     |
| tennessee            | no-tax          | NONE                                                                                                                                                                                                     |
| texas                | no-tax          | NONE                                                                                                                                                                                                     |
| utah                 | done            | flat rate                                                                                                                                                                                                |
| vermont              | **provisional** | brackets = 2026 IN-114 "Preliminary" rates; SD derived from GB-1210; TaxRateSched-2026 and IN-111-2026 still 404 (checked 2026-10-30)                                                                    |
| virginia             | done            |                                                                                                                                                                                                          |
| washington           | **provisional** | no wage tax; WA Cares 0.58% confirmed; capital-gains SD CARRIED FROM 2025 — DOR must post the 2026 amount by 2026-10-31 (RCW 82.87.150), not yet up 2026-10-30                                           |
| west_virginia        | done            |                                                                                                                                                                                                          |
| wisconsin            | done            | all four statuses (SD bands and brackets) printed in the 2026 Form 1-ES; MFS and HOH no longer derived (checked 2026-10-30)                                                                              |
| wyoming              | no-tax          | NONE                                                                                                                                                                                                     |

## Provisional detail (revisit before relying on these)

Rewritten 2026-10-30. Every item below was checked that day; the evidence is
in [Third sweep](#third-sweep-2026-10-30). Items resolved since the first
draft of this list (connecticut, nebraska, wisconsin, california, Rhode Island
and South Carolina deductions, Pennsylvania municipal rates) are recorded
there too.

- **vermont** — Brackets are the "2026 Preliminary Vermont Tax Rates" in the
  2026 IN-114 instructions (Rev. 10/25); the standard deduction is derived
  from GB-1210-2026's withholding thresholds (single 3,925 x 2, joint
  11,775 / 0.75) and head of household from the statute. TaxRateSched-2026
  and IN-111-2026 are still 404. TaxTables-2026 on the "2026 VT Tax Tables"
  page is the withholding percentage table, not a rate schedule.
- **washington** — Capital-gains standard deduction $278,000 CARRIED FROM 2025. RCW 82.87.150 has DOR post the TY2026 amount by 2026-10-31; not up on
  2026-10-30.
- **oregon** — Head-of-household standard deduction (4,680, derived), the
  married-filing-separately federal-tax-subtraction cap (4,375, half the cap)
  and the $263 exemption credit (withholding figure) await the 2026 OR-40
  instructions (404 on 2026-10-30).
- **arizona** — Standard deduction = federal 2026 amounts; ADOR publishes the
  Arizona figure only in the TY2026 Form 140 booklet (January 2027).
- **arkansas** — Standard deduction $2,470 rests on the withholding formula
  and the 2026 AR1000ES worksheet; the 2026 AR1000F instructions are
  unpublished.
- **idaho** — Zero-rate bracket top (4,811 / 9,622) CARRIED FROM 2025; the
  Tax Commission's rate-schedule page still ends at 2025.
- **indiana** — No 2026 Schedule CT-40 yet. Boone moved to 1.71% on
  2026-10-01 (DN #1 R47 / 10-26), so its annual rate will be a CT-40 blend;
  the file keeps the January 1 rate, 1.7%.
- **pennsylvania** — Not provisional; noted for the convention. Philadelphia's
  resident wage tax was 3.74% on 2026-01-01 and 3.735% from 2026-07-01
  (phila.gov rate table); the file carries 3.74% per the start-of-year
  convention.

## Data-quality flags found in the 2025 source files

The fan-out surfaced pre-existing errors in `src/data/2025/`. **Both were fixed
in the 2025 originals on 2026-08-12** (spot-check confirmed against sources):

- **delaware** — Wilmington city wage tax was `1.5%`; corrected to `1.25%`
  (confirmed via City of Wilmington + multiple payroll sources). Fixed in 2025
  and 2026.
- **vermont** — The 2025 file had a spurious `5.4%` bracket (VT has 4 non-zero
  rates: 3.35 / 6.60 / 7.60 / 8.75%) **and** wrong thresholds. Replaced the
  whole schedule with the official 2025 return rate schedule (Single/MFS caps
  53225 / 123525 / 253525; MFJ/HOH 93975 / 210925 / 315475), cross-checked
  across two independent sources and the official withholding charts.

### Resolved: 2026 Vermont carried from corrected 2025

The fan-out's 2026 Vermont brackets were backwards (single 3.35% cap below the
2025 value). Replaced on 2026-08-12 by **carrying the corrected official 2025
return schedule forward** (provisional). VT indexes annually, so the true 2026
figures will be slightly higher — revisit once VT publishes TaxRateSched-2026.
Standard deduction keeps the repo's federal-amount convention ($16,100 /
$32,200 / $16,100 / $24,150).

## Audit corrections (2026-08-29)

A repo-wide audit found tax types that were present in 2023/2024 and silently
absent from 2025 and 2026 — the 2025 files dropped them and the 2026 fan-out
inherited the omission. Restored in **both** years, with sources:

| Entry                                            | Restored value                                                         | Source                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| colorado / `colorado_famli`                      | 0.45% (2025) / 0.44% (2026) employee share, capped at the SS wage base | famli.colorado.gov; total premium 0.9% → 0.88% for 2026                                                    |
| connecticut / `ct_paid_family_and_medical_leave` | 0.5%, capped at the SS wage base                                       | ctpaidleave.org — Board held the rate at 0.5% for 2026                                                     |
| hawaii / `hi_temporary_disability_insurance`     | 0.5% up to $74,969 (2025) / $78,010 (2026)                             | labor.hawaii.gov max weekly wage base $1,441.72 / $1,500.21                                                |
| rhode_island / `standard_deduction`              | 10,900 / 21,800 / 10,900 / 16,350                                      | 2025 RI-1040 instructions. 2026 superseded: ADV 2025-22 (see rhode_island.ts)                              |
| south_carolina / `standard_deduction`            | 15,000 / 30,000 / 15,000 / 22,500                                      | SC conforms to the IRC as of 2024-12-31 and adds back the OBBBA increase. 2026 superseded by Act 110 SCIAD |

**Confirmed correct as-is** (absence was not a bug): `colorado/aurora` — Aurora
repealed its occupational privilege tax effective 2025-01-01 (Ordinance
2022-77). A comment now records this so it does not read as another omission.

### Portland Arts Tax rewritten for tax year 2026

`src/data/2026/state/oregon.ts` still carried the old `{ min: 1000, amount: 35 }`.
Portland Ordinance **192185** (passed 2026-05-27) replaced it for **tax year
2026** (first due 2027-04-15):

- $50 for single / MFS / head of household, $100 for married filing jointly
- Threshold is **Oregon taxable income**: $20,000 (single, MFS) or $40,000
  (MFJ, HoH) — the old $1,000 income and federal-poverty exemptions are repealed
- Rate and threshold begin inflation-indexing in tax year 2027 — revisit then

This is the first flat fee that varies by filing status and the first whose
threshold is measured against taxable rather than gross income; both are now
supported by the calculator (`basis` in [../README.md](../README.md)).

### Alabama cities: Mobile and Montgomery removed

Both levied a 1% occupational tax in every year of the data set. Neither has
one. The Alabama League of Municipalities publishes the full roster of
jurisdictions that do — **25 cities**, and neither is on it:

> Attalla 2% · Auburn 1% · Bear Creek 1% · Bessemer 1% · Birmingham 1% ·
> Brilliant 1% · Fairfield 1% · Gadsden 2% · Glencoe 2% · Goodwater 0.75% ·
> Guin 1% · Hacklebug 1% · Haleyville 1% · Hamilton 1% · Leeds 1% · Lynn 1% ·
> Midfield 1% · Mosses 1% · Opelika 1.5% · Rainbow City 2% · Red Bay 0.5% ·
> Shorter 1% · Southside 2% · Sulligent 1% · Tuskegee 2%

Corroborated by: al.com ("Most Alabama cities do not collect occupational
taxes, but there are 25 cities that do"); the City of Mobile's own revenue
pages, which list business license fees only and nothing withheld from wages;
and the Tax Foundation ("Birmingham is not Alabama's largest city by
population, but it is the largest city that taxes income").

**Montgomery has a paper trail.** The City Council passed a 1% occupational tax
in February 2020. In March 2020 Gov. Ivey signed HB 147, requiring legislative
approval for new occupational taxes and retroactively voiding it. As of January
2026 the council's legislative priorities still include seeking permission for
one. The tax was law for roughly three weeks and never took effect — a likely
route for it to have entered this data set from contemporary headlines.

**Macon County** is legitimate — it is a _county_ levy, which is why it does not
appear on the municipal list above. Its rate is **1%**; the 2023 file had 2% and
was corrected. Macon County now reads 1% in all four years.

Removing these two deletes `/{year}/alabama/mobile/` and
`/{year}/alabama/montgomery/` plus their `tax-tables` counterparts.

**Coverage gap narrowed.** The repo carried 4 jurisdictions; it now carries 27
— the League's 25 municipalities, Macon County, and Irondale (added later; see
below, and note that Irondale's absence from the League list means that list is
a floor, not a complete register). Rates below.

| Rate      | Jurisdictions                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2%        | Attalla, Gadsden, Glencoe, Rainbow City, Southside (all Etowah County — "the highest in the state"), Tuskegee                                                           |
| 1.5% → 1% | Opelika (cut effective 2025-04-01)                                                                                                                                      |
| 1%        | Auburn, Bear Creek, Bessemer, Birmingham, Brilliant, Fairfield, Guin, Hackleburg, Haleyville, Hamilton, Leeds, Lynn, Macon County, Midfield, Mosses, Shorter, Sulligent |
| 0.75%     | Goodwater                                                                                                                                                               |
| 0.5%      | Red Bay                                                                                                                                                                 |

**Sourcing and caveats:**

- Base roster from the **Alabama League of Municipalities**, which attaches its
  own disclaimer: rates "are those given to the League by survey and should be
  verified with the appropriate entity," and the League "takes no responsibility
  for … the accuracy of this tax rate information." Treat the small-town rates
  as provisional.
- Spot-verified against primary sources: **Auburn 1%** (auburnal.gov, several
  pages); **Opelika** (the city's own quarterly return form: "As of April 1,
  2025, the City of Opelika reduced the withholding fee from 1.5% to 1%");
  the **Etowah County 2% cluster** (al.com and Alabama Daily News, twice).
- The League list spells one town **"Hacklebug"**. The town is **Hackleburg**
  (Marion County); ALDOR lists it as a self-administered locality with Avenu as
  administrator. Corrected here.
- Rates are carried across all four years because Alabama's 2020 HB 147
  grandfathered existing occupational taxes and requires legislative approval
  for new ones. Opelika is the known exception — a _decrease_, which the law
  permits — and is modelled per-year.
- **Opelika 2025 is approximate.** The rate changed mid-year (1.5% through
  2025-03-31, 1% after). The data model has no mid-year mechanism, so 2025
  carries 1%, covering three of four quarters. Same limitation as the
  Philadelphia note above.
- **Possibly still missing:** a later Alabama Daily News piece cites _26_
  jurisdictions rather than 25, and payroll registries (Avenu/Mosey) list
  **Irondale**, **Tarrant** and **Beaverton** as having occupational taxes.
  Irondale has since been confirmed from the city itself and added. Tarrant and
  Beaverton publish no rate I could confirm and are still out.

### Corrections in earlier years

- **2024 federal** — single-filer top bracket started at `609351` against a
  previous `max` of `609350`; the only non-contiguous bracket in the federal
  data. Now `609350`.
- **2025 + 2026 arkansas** — used an inclusive-max convention (`max: 5499`
  beside `min: 5500`) that no other file uses. Normalized to contiguous.
- **south_carolina standard deduction** — SC begins from _federal taxable
  income_, so the federal standard deduction is already reflected. 2023 carried
  the wrong year's figures with head of household copy-pasted from
  married-filing-jointly; 2024 had head of household copy-pasted from single.
  Now 13,850 / 14,600 / 15,000 / 15,000 (single) across the four years, with
  2025–2026 reflecting SC's add-back of the OBBBA increase.
- **2024 massachusetts** — carried a standard deduction. Massachusetts does not
  allow one (mass.gov); it uses personal exemptions. Removed.
- **new_mexico standard deduction** — NM takes the federal amount straight off
  Form 1040 line 12 (PIT-1 line 12 is literally "Federal standard or itemized
  deduction amount"). 2024 was missing entirely; 2023 and 2025 carried stale
  values with head of household copy-pasted from married-filing-jointly. All
  four years now track federal: 13,850 / 14,600 / 15,750 / 16,100 (single).
- **2024 new_jersey** — `nj_disability_insurance` was dropped rather than
  modelled. NJ set the employee rate to 0% for 2023 and 2024; 2023 models that
  explicitly, so 2024 now does too.

## Wage-based taxes moved off the deduction-reduced base

Three tax types were being computed on income _after_ the state standard
deduction when the levying authority computes them on wages:

| Tax type                               | Basis, per the authority                                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `occupational_tax` (Alabama, Kentucky) | Louisville Metro: withhold "from the **gross** salaries, wages, commissions". Alabama municipal occupational taxes apply to gross wages. |
| `oregon_transit_tax`                   | Oregon DOR / EY: "calculated based on the employee's **gross wages before any exemptions or deductions**".                               |
| `employee_payroll_tax` (Eugene)        | Applied to wages, not to income after Oregon's standard deduction.                                                                       |

All three now sit in `grossIncomeTaxes` in `utils/calculator.ts`, alongside FICA
and the state paid-leave programs. Effect at $100,000 single: Birmingham
$970 → $1,000, Oregon transit $97.17 → $100.

City and county _income_ taxes were deliberately left on the after-deduction
base — Maryland's county tax, Indiana's county tax and NYC all start from state
taxable income, so that is correct for them.

### Resolved: Eugene's threshold is a rate lookup, not a bracket floor

Settled against the City's own published rate charts (`eugene-or.gov`
DocumentCenter 83387, 79205, 70580, 65902) and the Form EUG-PY-2 instructions.
The charts state the rule outright:

> "The purpose of the tax rate chart is to obtain the rate to be applied to
> **all** subject wages paid in a pay period."

and the return instructions repeat it: "The tax rates … are based on the gross
wages, less overtime wages, for the pay period. The applicable tax rate is then
applied to subject wages." So the bands select a rate; they do not bound what it
is charged on. Patriot Software's reading was right and the bracket-floor model
was wrong — it understated the tax at **every** income above the threshold
($302.26 instead of $440 on $100,000).

The calculator now supports this as a third schedule kind, marked with
`rate_on_total` (see [../README.md](../README.md)). Published annual charts:

| Chart period         | Exempt below | 0.30% band | 0.44% at or above | Used for       |
| -------------------- | ------------ | ---------- | ----------------- | -------------- |
| 7/1/2021 – 6/30/2022 | $26,541      | to $31,221 | $31,221           | —              |
| 7/1/2022 – 6/30/2023 | $28,101      | to $31,221 | $31,221           | —              |
| 7/1/2023 – 6/30/2024 | $29,557      | to $31,221 | $31,221           | **2023, 2024** |
| 7/1/2025 – 6/30/2026 | $31,304      | (none)     | $31,304           | **2025**       |
| 7/1/2026 – 6/30/2027 | $32,344      | (none)     | $32,344           | **2026**       |

The 0.30% tier is Ordinance 20616's reduced rate for wages between the
annualized Oregon minimum wage and the $15.00/hr equivalent. It disappeared once
the minimum wage passed $15.00 on 7/1/2025 — the 2025 chart says so in a note.

Caveats, both flagged rather than papered over:

- **Charts change on July 1, so a calendar year straddles two.** Each year uses
  the chart that _takes effect during_ it, which is what the 2025 file already
  did. Same limitation as Philadelphia and Opelika.
- **No 7/1/2024 – 6/30/2025 chart was ever published**, as far as I can find.
  The City's Employee Payroll Tax page still linked the 7/1/2023 chart in both
  March and April 2025 (Wayback 20250303120819, 20250401024035), so 2024 carries
  that one. The previous 2024 file had `24,960` and `31,200`, which match no
  published chart at all — those are $12.00 and $15.00 × 2080 and appear to have
  been invented.
- The lookup is against gross wages _less overtime_, and the tax then applies to
  subject wages (gross less pre-tax deferrals). The app has no overtime concept,
  so both use gross-after-401(k).

### Resolved: Pennsylvania `local_earned_income`

No change needed, for a duller reason than expected: `LOCAL_EARNED_INCOME` is an
unused constant. Pennsylvania's municipal wage taxes are modelled as
`city_income`, and no Pennsylvania file carries a `standard_deduction` in any
year, so its taxable base already equals gross. The constant is worth either
using or deleting, but nothing computes wrong today.

Chasing it did surface a real problem in two other states — below.

### Missouri earnings taxes moved to the gross basis

`city_income` covers two different animals, and the calculator was treating both
as post-deduction:

| City                   | Basis                                    | Source                |
| ---------------------- | ---------------------------------------- | --------------------- |
| Yonkers                | state taxable income — **correct as-is** | NY resident surcharge |
| Kansas City, St. Louis | wages                                    | RSMo 92.111(2)(1)     |

RSMo 92.111(2)(1) levies the earnings tax on "salaries, wages, commissions and
other compensation earned by its residents". St. Louis's own taxable-items page
agrees: gross pay less pre-tax deferrals (cafeteria plans, 401(k), HSA), nothing
else. Missouri's standard deduction tracks the federal one, so charging 1% after
it understated the tax by **$161 at every income above $16,100**.

Since one tax type now spans both bases, the base is declared in the data:
`basis: GROSS_INCOME_BASIS` on the Kansas City and St. Louis schedules, all four
years. Yonkers is untouched and a test pins it that way.

### Alabama: Irondale added, and the League's roster is not exhaustive

The City of Irondale publishes its own occupational licence fee history, which
settles one of the three open jurisdictions:

- 1% from 2018-08-01 (Ordinance 2018-10c)
- 0.75% from 2022-07-19 (Ordinance 2022-14)
- 0.50% from 2024-07-02 (Ordinance 2024-12)

So 2023 = 0.75%, 2024 = 0.75% (pre-change; the cut lands almost exactly
mid-year), 2025 = 2026 = 0.50%.

**This changes how much the Alabama League of Municipalities roster can be
trusted.** Irondale (pop. ~13,000, and a Birmingham suburb) has levied an
occupational tax since 2018 and is not on the League's list of 25. The list is a
survey, not a register, and the earlier claim here that "all 26 are now present"
was wrong. It is a floor, not a ceiling — which also explains the Alabama Daily
News piece citing 26 jurisdictions.

This does **not** reopen Mobile or Montgomery: those rested on the cities' own
publications and, for Montgomery, the HB 147 paper trail, not on the roster
alone.

**Tarrant and Beaverton remain unconfirmed.** Tarrant's website has a business
licence application and no occupational tax page of any kind; Beaverton (pop.
~200, Lamar County) publishes nothing. Neither was added.

### Washington capital gains: standard deduction was two years stale

The 2025 and 2026 files carried $270,000, which is the **2024** figure. DOR
publishes $278,000 for 2025 (the deduction is indexed annually). The 9.9% tier
is SB 5813's 2.9-point surcharge on Washington capital gains above $1,000,000,
so its floor is the deduction plus $1,000,000 and moves with it:

| Year | Deduction                      | 7% band       | 9.9% above |
| ---- | ------------------------------ | ------------- | ---------- |
| 2023 | $262,000                       | —             | —          |
| 2024 | $270,000                       | —             | —          |
| 2025 | **$278,000**                   | to $1,278,000 | $1,278,000 |
| 2026 | **$278,000 CARRIED FROM 2025** | to $1,278,000 | $1,278,000 |

Re-checked 2026-10-30: still unpublished; RCW 82.87.150 makes it due by
2026-10-31.

2026's indexed amount is unpublished. At $300,000 of gains this moved the tax
from $2,100 to $1,540.

### Still to check

- **Wilmington, DE `city_income`** — **RESOLVED 2026-09-07.** It was the same
  error as Missouri: a 1.25% wage tax charged on income after Delaware's $3,250
  standard deduction. 22 Del. C. § 903 defines the base as "the total income
  from whatever source earned", and the City's own budget schedule reads "WAGE
  TAX / Base: Individual gross earned income of City residents." Now carries
  `basis: GROSS_INCOME_BASIS` in all four years. Worth $40.63/yr single,
  $81.25 married. (wilmingtonde.gov still 403s; delcode.delaware.gov and
  wilmdebudget.org are the reachable primary sources.)
- **Michigan, Ohio, New Jersey `city_income`** are levied on wages too, but
  those three states carry no `standard_deduction` in the data, so their base is
  already gross and nothing computes wrong today. If a standard deduction is
  ever added to one of them, it must come with `basis: GROSS_INCOME_BASIS` on
  the city schedules.
- **Yonkers** is modelled as a flat 0.5%, which is the _non-resident_ earnings
  tax. The resident tax is a 16.75% surcharge on net New York State tax. Someone
  selecting Yonkers in a take-home calculator most likely means a resident.
  Separate issue from the basis question, and not touched here.

## Open questions / to revisit

- Several states index brackets to inflation and may not have published final
  2026 figures this early — expect a batch of `CARRIED FROM 2025` entries.

- **Alabama** — Tarrant and Beaverton appear in payroll registries as
  occupational-tax jurisdictions but publish no rate I could confirm. The small
  towns carried from the League's survey should be verified city by city; the
  roster demonstrably misses at least one real jurisdiction (Irondale).
- **Irondale 2024** — carries 0.75%; the true year is 0.75% through 2024-07-01
  and 0.50% after.
- **Opelika 2025** — carries 1%; the true year is 1.5% for Q1 and 1% after.
- **Portland Arts Tax 2027** — rate and threshold begin indexing.
- Oregon 2026 was pre-existing and has uncommitted edits; confirm its figures
  are true 2026 values before final commit. _2026-10-30: brackets and
  single/joint deduction confirmed; three figures still await the 2026 OR-40
  instructions (see Provisional detail). Oregon 2023 and 2025 brackets were
  wrong; fixed 2026-10-30 — see Third sweep._

---

## Full correctness audit (2026-09-07)

An audit of the calculation engine and all four years of data. It began as 13
findings against `src/utils`; verifying them turned up far more in the data.
Roughly **150 wrong figures** were corrected across the engine, federal data,
20 states and the entire city/local layer.

Everything below was verified against the taxing authority's own published
document. Where a figure could not be sourced it was **left unchanged and
flagged in the file**, never guessed.

### Read this first: the failure mode that dominated

Ten of the day's most serious defects were the same thing — **a plausible
number taken from a document that answers a different question.**

| Wrong source taken                                                       | Right source                         |
| ------------------------------------------------------------------------ | ------------------------------------ |
| Indiana Departmental Notice #1 (withholding)                             | Schedule CT-40 (annual, blended)     |
| Maryland January payroll memo                                            | Withholding Tax Facts rev 07/25      |
| Vermont `RateSched-YYYY` (a withholding chart, despite the name)         | `TaxRateSched-YYYY`                  |
| Nebraska statute's un-indexed base amounts                               | the in-force indexed figures         |
| Idaho statute's un-indexed base; 2023 bracket tops in the deduction slot | Form 40 worksheet                    |
| Covington KY net-profits rate                                            | payroll withholding rate (same page) |
| Owensboro KY county rate                                                 | city rate                            |
| Oregon Publication OR-ESTIMATE (labelled "Estimated")                    | the final withholding revision       |
| New Mexico pre-2025 boundaries with post-2025 rates                      | §7-2-7 as enacted by HB 252          |

This is more common than staleness and far more dangerous. A stale figure was
right once and _looks_ stale. A wrong-source figure was never right and looks
entirely reasonable — it survives schema validation, every internal-consistency
heuristic, and a careful reviewer. **Always confirm you are reading the document
the annual return itself uses.**

Corollary, learned repeatedly: **web-search summaries were wrong on every state
where they were checked.** They gave a head-of-household figure off by $4,270,
asserted two contradictory answers in one result set (Kentucky), claimed a state
needed no check when it had a real bug (Georgia), and dismissed correct statutory
figures as "confusion with a different tax year" (New Mexico). Pull the PDF and
extract it.

### Standing per-state sourcing rules

- **Indiana** — use Schedule CT-40 (form 47907) for the tax year, never
  Departmental Notice #1. DN #1 is withholding-only. Counties may change rate on
  1 October, and CT-40 then carries a 9-month/3-month blended annual rate that
  DN #1 never publishes. **Long-decimal rates like `.01618` or `.024875` are
  official blends, not typos — do not "tidy" them.** Where no CT-40 exists yet
  (2026 today), DN #1's 1 January table is a provisional stand-in that must be
  re-checked when CT-40 appears.
- **Maryland** — the January state payroll memo is not authoritative for an
  annual rate. The 2025 Budget Reconciliation Act let a county adopt the new
  3.30% cap _retroactively_ for TY2025; Dorchester was the only one that did, so
  the January memo says 3.20 and the correct annual rate is 3.30. Use
  Withholding Tax Facts (rev 07/25 or later). The live Comptroller rate page now
  redirects to a JS-only ServiceNow article and cannot be scraped; use Wayback.
- **Vermont** — the file Vermont names `RateSched-YYYY` is the _withholding_
  wage-bracket chart. The rate schedule is `TaxRateSched-YYYY` or the table
  inside the IN-111 instructions. GB-1210 is also withholding. This naming trap
  is how 2025 and 2026 got the wrong numbers.
- **Nebraska** — the 1040N booklet contains only the tax _table_, not the rate
  schedule. Bracket boundaries live in a separate history PDF linked from inside
  the chronology. Neb. Rev. Stat. 77-2715.03(2)(a)'s amounts are a base that
  subsection (3)(a) requires to be inflation-adjusted — never use them directly.
- **Pennsylvania** — the DCED official EIT register is the authoritative
  per-municipality source and is not otherwise scrapeable (ASP.NET ReportViewer;
  needs a cookie-jar session, then `Reserved.ReportViewerWebControl.axd` with
  `OpType=Export&Format=CSV`). **Resident total = municipal rate + school
  district rate.** Three municipalities had the school component silently
  dropped.
- **New Mexico** — TRD moved 2023/2024 forms off `realfile.tax.newmexico.gov`
  (they 404) onto a RealFile-backed store; enumerate via the `SearchFiles`
  endpoint recorded in the New Mexico file comments.
- **Alabama** — the League of Municipalities roster is a survey, disclaims its
  own accuracy, **and is stale**: it still shows Opelika at 1.5% after the
  April 2025 cut to 1%. It is also a floor, not a complete register — Irondale
  and Tarrant both levy and neither is listed.

### Cross-check technique worth reusing

Where a state publishes a tax computation worksheet ("multiply by R and subtract
S") or a cumulative tax figure at each bracket floor, **that column reconciles
only with correct boundaries**. It is an independent arithmetic test needing no
second document, and it settled Wisconsin, West Virginia, North Dakota, Nebraska
and New Mexico. Reproduce it and show the arithmetic in the file comment.

### Engine corrections

- **FICA was charged on wages after the 401(k) deferral.** A pre-tax elective
  deferral reduces W-2 box 1 only; boxes 3 and 5 are unchanged (IRS Topic
  No. 424). Understated FICA by up to **$1,797.75** at the 2025 maximum. The
  calculator now carries three income figures and `GROSS_INCOME_BASIS` means
  true wages everywhere, in rate schedules and flat-fee thresholds alike. A unit
  test _and_ its "independent verification" helper had both encoded the wrong
  rule, which is why it survived.
- Cities can now declare their own `standard_deduction`; exemptions are scoped
  per jurisdiction so a city tax and a same-named state tax exempt
  independently; `calculateFlatFee` is order-independent; `parseIncomeParam`
  rejects malformed input instead of silently reinterpreting it.
- The `standard_deduction` slot holds **whatever a state subtracts before
  applying its rate** — not literally a standard deduction. Connecticut's
  personal exemption already lived there before this audit.

### Known gaps still open

- **Ohio's base amount is not modelled** — ORC 5747.02(A)(3) charges a flat
  $360.69 / $342.00 / $332.00 (by year) the moment taxable income clears
  $26,050, plus 2.75% of the excess. A marginal bracket list is continuous by
  construction and cannot express a step. **Understates ~5 million filers**; at
  $30,000 a filer owes $450 and is charged $109. Documented in all four
  `ohio.ts` files as KNOWN UNDERSTATEMENT.
- **Yonkers — RESOLVED.** Was modelled as the flat 0.5% _non-resident_ earnings
  tax; a resident owes a **16.75% surcharge on New York State tax** (IT-201
  line 55). Residents were understated 41–48%, widening with income. Now uses a
  third basis, `state_income_tax`, so the surcharge derives from the computed
  state tax. Deliberately **not** written as the state ladder × 0.1675 — exact
  today, but it would duplicate New York's brackets in a second place and go
  stale at the next state rate change.
- **Personal exemptions — RESOLVED for Illinois, New Jersey and Ohio.** Illinois
  $2,425/$2,775/$2,850/$2,925 with its cliff (allowance disallowed entirely
  above $250k federal AGI / $500k joint; **MFS groups with single**, same amount
  and same threshold). New Jersey $1,000 flat. Ohio tiered on modified AGI
  ($2,400 / $2,150 / $1,900) **plus a cap** — $0 above $750,000 for 2025,
  $500,000 from 2026. All model the no-dependants case, stated per file.
  Ohio's exemption composes with its base amount: a filer on $28,000 of wages
  now owes nothing, since $28,000 − $2,400 falls under the $26,050 threshold.
- **Michigan's city personal exemption ($600) remains unmodelled** — it scales
  with dependants and there is no dependants input, so modelling it would swap a
  documented understatement for a hidden assumption. Worth $6–$58/yr.
- **Ohio's city taxes were on the wrong base, found while adding the exemption.**
  ORC 718.01(R) defines the municipal base as IRC §3121(a) wages — W-2 box 5 —
  which a 401(k) deferral does not reduce. A Columbus resident at the 2025
  maximum was **$587.50/yr** light. Fixed with `basis: GROSS_INCOME_BASIS`; this
  is the FICA defect resurfacing in a different part of the tree.
- **Alabama, Wisconsin, Connecticut, Maine and Montana** publish a standard
  deduction that shrinks with income; the stored figure is the maximum. Alabama
  is the worst — every filer above ~$35,500 AGI is at the floor, so the stored
  maximum is wrong for essentially every realistic income.
- Kentucky: **Florence and Boone County** stacking rules unresolved;
  **Covington's** wage cap unresolved (the SOS register shows an
  uninterpretable "$80,000"). Lexington is a **2026 watch item** — FCPS voted to
  raise its levy to 0.75%, AG opinion 25-07 found the vote improperly noticed
  and it was paused; if properly re-noticed, Lexington goes to 3.00%.
- Alabama: **Beaverton** unconfirmable (administrator blocks access); twelve
  small towns rest on the League survey alone.
- 2026 head-of-household deductions for **Nebraska** and **Oregon** are
  unsourced — neither state publishes HoH outside a booklet that is not yet out.
  _2026-10-30: Nebraska resolved — the 2026 1040N-ES prints $12,950. Oregon
  still open._

### City/local layer — full sweep results

Every city and county rate in the repo was checked against the jurisdiction's
own document. **80 wrong figures out of roughly 850 rates**, plus seven
structural fixes that no rate audit would have found.

| State                          | Wrong / checked | Character of the errors                                                   |
| ------------------------------ | --------------- | ------------------------------------------------------------------------- |
| Maryland                       | 26 / 96         | 2024 seeded from a ~2010–2015 table; two graduated counties modelled flat |
| Pennsylvania                   | 20 / 56         | school-district component dropped; Philadelphia half-year confusion       |
| Kentucky                       | 12 / ~56        | wrong rate column; county rate used for a city; school levies omitted     |
| Indiana                        | 12 / 368        | 2025/2026 carried 2024's blends; two Jan-2025 rises missed                |
| Ohio                           | 9 / ~28         | staleness, some since 2020–21                                             |
| West Virginia                  | 1 / 24          | one ordinance missed                                                      |
| Alabama                        | 0 / ~108        | roster and rates all confirmed                                            |
| Michigan                       | 0 / 96          | —                                                                         |
| Missouri, New Jersey, Delaware | 0 / 16          | —                                                                         |
| New York, Colorado, Oregon     | 0 / ~50         | —                                                                         |

**The error rate tracks how freely a rate can move, not how many jurisdictions
there are.** Michigan has 24 cities and zero defects, because MCL 141.611 caps
them at 1% and the four exceptions are closed statutory classes no other city
can enter — a constraint that can be proved once, rather than 24 pages that must
be re-checked. Pennsylvania has 14 municipalities and twenty defects, because
each sets its own rate _and_ its school district sets another, and the resident
figure is the sum of two independently moving parts.

**Structural fixes** (all cases where the number was right and the treatment was
wrong — invisible to any rate check):

- **Wilmington DE** — a gross-wage tax charged on income after Delaware's
  standard deduction. Now `basis: GROSS_INCOME_BASIS`.
- **Newark NJ** — an _employer_ payroll tax charged to the employee, ~$1,000/yr
  at $100k. Reclassified to `employer_payroll_tax` and listed in
  `NON_WAGE_TAX_TYPES`: still documented in the tax tables, never charged.
- **Frederick MD** — a rate lookup modelled as marginal brackets in all four
  years. Second jurisdiction after Eugene to need `rate_on_total`.
- **Newport and Florence KY** — both cap at the Social Security wage base and
  both ran to `INFINITY`. Newport at $400k was charging $10,000 against a real
  $4,612.50.
- **Florence KY** — Boone County's three levies stack on the city fee and none
  were modelled. A resident at $50,000 was shown $1,000 against a real $1,675.
- **Lexington and Bowling Green KY** — school-district levies omitted while
  Louisville's 2.2% already included its own, so the comparison page was wrong
  between cities in the same state.
- **Anne Arundel MD** — modelled flat at what was only its middle band.

**Roster changes:** Tarrant AL added (Ordinance 1132, absent from the League
roster). Beaverton AL, Union KY and Walton KY deliberately **not** added — each
unsourceable or indeterminate, and an absent jurisdiction is visibly incomplete
where a wrong rate is invisibly wrong. Union declared a payroll tax holiday for
exactly the first half of 2023, so the repo's "carry the rate covering most of
the year" convention yields no answer; Walton straddles Boone and Kenton
counties, whose levies differ substantially, so any entry would have to pick one.

**Two neighbouring Kentucky counties have opposite stacking rules**, each stated
plainly in its own words: Warren says the city and county fees "cannot be charged
on the same dollar earned"; Boone says "these taxes are independent of each
other, and both must be withheld as applicable." Both quotes are in the files,
set against each other, because that is the pair a reader will conflate.

### Income-phased standard deductions — now modelled

Five jurisdictions publish a deduction that varies with income. The schema
previously stored one number, so the repo used the maximum for everyone.
`standard_deduction` now accepts a schedule of `DeductionBand`s as well as a
flat number; roughly forty states still use the flat form and are untouched.

| State                 | Shape                                                | Who it moves                                                                                                   |
| --------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Alabama               | stepped, $175 per $500, floor $5,000                 | **essentially everyone above $35,500** — flat +$175 joint, +$135 head of family, +$87.50 separate, +$25 single |
| Connecticut           | dollar-per-dollar taper to zero                      | above $44k single / $71k joint — +$775 to +$1,280                                                              |
| Maine                 | linear taper to zero over a fixed span               | above the ~$100k threshold — +$415 to +$2,245                                                                  |
| Wisconsin             | rate taper, two-stage for head of household          | across its phase-out range                                                                                     |
| Montana **2023 only** | 20% of AGI, floored and capped — _rises_ with income | **below** $27,700 / $55,400 only; a no-op above                                                                |

Montana runs the opposite direction from the rest and only 2023 needs it: SB 399
moved the state to federal taxable income from tax year 2024, so the federal
deduction flows through and there is nothing to phase. **Do not band Montana
2024–2026.**

Three shapes the data forced into the schema, none of which would have been
designed from first principles:

- **`reduce_from`** — Wisconsin's head-of-household schedule phases down until it
  meets the _single_ filer's schedule, then continues on that schedule while the
  DOR keeps measuring from the **first** threshold. Without this field that band
  is wrong by ~$4,500 of deduction at $57,211. It appears exactly once in the repo.
- **`percent_of_income`** — Montana's deduction rises to a cap. The validator
  originally rejected this outright under a rule that a deduction can never rise
  with income; the rule is now monotonicity in either direction. **If the
  validator rejects data you have sourced correctly, the validator is the thing
  to question.**
- **A cliff is just `amount: 0`** above the threshold — the same representation as
  a taper, but a different thing. Illinois needs it (its allowance is disallowed
  entirely above $250k / $500k).

**Transcription traps, both hit more than once:**

1. **"Or part or fraction thereof"** — Alabama and Connecticut round the step
   count _up_; `reduce_per` counts whole steps _down_. Reconciled by starting
   each tapering band at the source's **first reduced row**, so Alabama joint
   reads `amount: 8325` rather than the headline $8,500. Every constant in the
   file is then a number printed on the state's page. The alternative was a
   `reduce_from` appearing in no document.
2. **Half-open on the wrong side** — Connecticut prints Table A as "More Than /
   Less Than or Equal To", the opposite side from a deduction band, so every
   boundary sits one dollar above the printed figure. Wisconsin needed the same
   shift.

**⚠ Alabama's own Form 40 chart contains a typo, in the 2023, 2024 and 2025
booklets alike:** its joint column's third row reads "$25,500 – $26,999" where
it must be $26,500. The other three columns and the state's own withholding
formula both confirm $26,500. **This is why the formula was used rather than the
21-row chart** — a literal transcription would have copied the typo and looked
like faithful sourcing. Where a state publishes the same rule twice, the two can
disagree, and "I used the official document" stops being sufficient.

**Known bounded divergence — Maine, $1.** MRS rounds its worksheet's line 5 to
four decimals and the calculator does not, so 77 of 736 sampled points differ by
exactly $1 of _deduction_ (about 7 cents of tax), in both directions, only where
the exact figure lands on a half dollar. Recorded in each Maine file.

Verification: 2,872 checks against the real resolver and the real data files,
reproducing every printed Alabama chart row and every Connecticut Table A row at
first dollar, midpoint and last dollar, with Maine's and Montana's worksheets
**independently reimplemented** rather than restated. Wisconsin separately
reproduces all 274 rows of the Form 1 table for all four statuses. Independent
reimplementation is the point — testing a schedule against itself proves
nothing, which is precisely how this repo's FICA bug survived behind a passing
test _and_ a passing "independent verification" helper.

### Tooling added

`npm run detect-suspect-figures` — heuristics for wrong _values_, the class
`validate-tax-data` cannot see because it checks that a schedule is well formed
and never that its numbers are right. Six checks, **each one added because a
specific real bug defeated the previous ones**:

| Check                                            | Added because                                       |
| ------------------------------------------------ | --------------------------------------------------- |
| Two filing statuses share a schedule             | Vermont 2025 copied MFS from single, HoH from joint |
| Indexed schedule repeated in adjacent years      | North Dakota 2025 held 2024's boundaries            |
| First bracket boundary falls year over year      | Idaho 2025 held the un-indexed statutory base       |
| Standard deduction falls year over year          | Wisconsin, DC, ND, Vermont, Mississippi             |
| Status-to-single ratio breaks a state's own norm | the head-of-household slot, four states             |
| A rate lower than **both** adjacent years        | Maryland 2024, seeded from a ~2010–2015 table       |

They are **warnings, not build failures** — a legislature really can cut a
deduction, and the first time one does a hard check would block CI over correct
data. Three cautions written into the script itself:

1. **A flag identifies a suspect _year_, not a suspect cell.** In three of five
   states the flagged field was not the only wrong one that year — one bad
   figure sat beside three more, and one bracket flag sat on top of eight wrong
   boundaries.
2. **A decrease says which series is anomalous, never which side of the step is
   wrong.** Mississippi had two series step 3400 → 2300 at the same boundary and
   the correct repairs went in _opposite_ directions.
3. **Ratios are descriptive, not normative.** Kentucky's joint return gets one
   single deduction (1.00×), Alabama's schedule is 2.83×. Never "correct" a
   state toward the 2.00× that most states happen to use.

**What it cannot catch:** a figure that is simply wrong while remaining
internally consistent. Wisconsin's brackets and Maryland's decade-stale 2024
were only found by reading the source. A cross-year equality check was tried
first and rejected — 61 warnings to catch one bug, and structurally blind to two
of the three cases it was aimed at.

### A note on "2024 is the worst year"

Five states independently showed 2024 as their worst year and it looked
systematic. It is not, and the year is the wrong axis: Indiana was **flawless**
in 2023 and 2024 with all 12 of its errors in 2025/2026. Even among the states
where 2024 was worst, the mechanism differs — Indiana-style "someone updated and
stopped halfway" is a different fault from Maryland 2024's "this file was seeded
from an ancient table", and the second leaves no year-over-year discontinuity to
detect at all.

---

## Second sweep (2026-09-08)

The first audit left **14 income-taxing states whose bracket schedules had never
been checked against a primary source**, and had not re-read the engine after a
day of rewriting it. Both gaps were closed.

### Result: 9 of 14 states were clean

| Clean, all four years                                                                          | Defects found                                                                       |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Oklahoma, Minnesota, Virginia, Delaware, Massachusetts, Arizona, Georgia, North Carolina, Utah | Arkansas 11, Hawaii 12, South Carolina 6 + a structural replacement, Rhode Island 4 |

**Oklahoma is the strongest confirmation in either audit**: the repo's schedules
reproduce **all 2,003 rows of OTC's printed tax table in both status columns,
zero mismatches, three years running**. Evaluating a schedule at each printed
row's midpoint pins every boundary and every rate _individually_; a cumulative
column can be satisfied by compensating errors, a full table cannot.

### Defects worth naming

- **Hawaii 2024 head-of-household held the 2025 ladder** — 11 of 12 rows. Act 46
  widened brackets only from 2025, and DOTAX Announcement 2024-03 says so
  outright; single, joint and MFS were all correctly still on the 2023 ladder.
  $1,152/yr understated at $100k.
- **Hawaii 2023 TDI ran to `INFINITY`** — $500/yr charged against a $342.80
  statutory maximum. The New York disability defect in a second place.
- **South Carolina's brackets came from `WH1603F`, the withholding formula**,
  which SCDOR publishes each November off the _preceding_ year's indexing. Wrong
  in three of four years.
- **South Carolina 2026**: Act 110 decoupled from IRC §63(b)–(g) and replaced the
  federal deduction with the phasing-out SCIAD. The file still carried
  $15,000/$30,000/$22,500 — **$781.50/yr** understated above $95,000 of AGI.
- **Arkansas** was wrong in three of four years: 2023 held pre-indexing statutory
  amounts, 2025 was a year stale in both brackets and deduction, and 2026 missed
  Act 1's fifth top-rate cut since 2023 (4.9 → 4.7 → 4.4 → 3.9 → 3.7).
- **DC paid family leave is employer-borne** — D.C. Code § 32-541.03(a). Newark
  in a second place; **$750/yr** at $100k. Now in `NON_WAGE_TAX_TYPES`.

### Engine review — four defects the tests did not catch

Reviewed **read-only by an agent that wrote none of it**, which is the point: the
author of four mechanisms landed in quick succession is the worst placed to see
what they do together.

1. **A crash.** Exempting New York's state income tax with Yonkers selected threw
   `TypeError` from inside a render-time `useMemo`, with **no `error.tsx`
   anywhere in `src/app`**. `?? ZERO` guards null but not the `EXEMPT` string
   sentinel. Introduced by the Yonkers work the day before.
2. **The bracket ladder ignored `percent_of_total`** — Oregon Paid Family and
   Medical Leave drew $1,000 against $600 charged. The only such mismatch in the
   dataset, swept across every state × city × status × year.
3. **Switching state kept the previous state's standard deduction and applied
   it.** Fifteen states declare none, so the map was never overwritten:
   New York → Pennsylvania undercharged $245, Massachusetts $802 married — and
   the field _displayed_ the stale figure as fact.
4. **A flat fee with no `min` was charged at $0 income**, rendering negative
   take-home on the Compare page.

**Verified sound:** `money.ts` diffed against a real dinero v1.9.1 install over
**986,118 cases, zero mismatches**; Ohio's base amount composing correctly with
its banded exemption at every boundary; tax monotone in both income and 401(k)
contribution across the whole dataset; no crashes or NaN on edge inputs.

### Three states where a "suspicious" shape is the law

Every one would trip a ratio heuristic. Every one is correct.

- **Minnesota** — MFS exactly half of MFJ is M.S. 290.06 subd. 2c.
- **Oklahoma** — head of household shares the joint schedule; that is OTC's own
  column heading.
- **Virginia** — head of household holds the single amount because **Virginia has
  no head-of-household filing status**.

This is why the heuristics summon a human rather than fail a build. Kentucky made
the same point in the first audit, where the detector flagged the only correct
year as the anomaly.

### Sourcing rules added

- **An agency's own "current rate" page can be the stale document.** Utah's Tax
  Commission page still read "January 1, 2025 – current: 4.5%" in August 2026; it
  is the TY2025 edition of a per-tax-year site. S.B. 60 sets 4.45% retroactive to
  2026-01-01. The repo was right and the page was wrong — the opposite of the
  usual direction.
- **Statute beat booklet in Utah; booklet beat statute in Arizona**, whose
  A.R.S. 43-1041(A) still reads the pre-2018 amounts with indexing language that
  looks like it would exclude OBBBA, while ADOR's Form 140 booklet publishes the
  post-OBBBA figures. There is no rule preferring one source — the rule is that a
  figure needs the document the _return_ uses, and **when two official sources
  disagree you need a third thing to break the tie**. South Carolina's did: its
  own computation schedule contradicts itself, and the 1,070-row official tax
  table settled it 1,069/1,070 against 67.
- **Hawaii**: use DOTAX Announcement 2024-03, not the N-11 booklets. It prints
  the whole Act 46 phase-in in one place — which years the deduction moves and
  which years the brackets move. A year's booklet tells you what that year _is_,
  never which years are _supposed_ to change, which is exactly how a 2025
  schedule got into a 2024 slot without disturbing anything.

### Two more failure modes, and one false alarm of my own

**A correct number in a shape that does nothing.** Arkansas 2024 carried
`{25700-92300, 3.9}, {92300-INFINITY, 3.9}` — and **$92,300 was exactly that
year's upper-table threshold.** Someone found the right figure, encoded it as a
bracket boundary with the same rate on both sides, and thereby encoded nothing.
A _wrong_ rate would have failed every reconciliation; a _right_ number in an
inert shape survived all of them, leaving only a phantom floor on the tax-tables
page as evidence. Watch for adjacent bands sharing a rate.

**A figure quoted from a state's tax TABLE is a band's value, not a point
value.** I flagged Arkansas 2025's reconstructed residual as $1.70 wrong against
DFA's printed $3,809 at $100,000. It was not: DFA's figure is the table row
_ending_ at $100,000, evaluated at its midpoint of $99,950. The residual
reproduces it exactly, and the same construction reproduces $4,544 (2023) and
$3,811 (2024) from their own constants. Comparing a calculator evaluated at a
band's edge against a table's band value is off by the rate times half the band
width — $1.95 on Arkansas's $100 grid — and looks exactly like a wrong constant.
Same family as Maine's +/-$1 rounding artefact and Ohio's half-cent tie.

**Truthy-zero was the bug three separate times in one day** — the banded-deduction
refresh, the state-switch prefill, and the flat-fee threshold. Each was a guard
where a legitimate zero read as "no value, keep what you had". In a tax
calculator zero is a real and common answer: a state can allow no deduction, a
phase-out can reach zero, a filer can owe nothing. Prefer `=== undefined` over
truthiness anywhere a money figure is being defaulted.

### Still open after this sweep

- **Arkansas has two rate schedules.** Above ~$94,700 a second table is charged on
  the whole income, bridged by a stepped adjustment. Understates $287–$441/yr,
  flat above the phase-out, zero below. Same class as Ohio's base amount.
- **Minnesota's standard deduction phases down** (M.S. 290.0123 subd. 5) and
  belongs with Alabama, Connecticut, Maine, Montana-2023 and Wisconsin. Missed by
  the first audit.
- **Massachusetts line 11** deducts up to $2,000 of Social Security and Medicare
  tax _actually paid_ — maxed by nearly every W-2 filer, worth ~$100 — but it is
  computed from another tax, which the schema cannot express.
- **Utah's taxpayer tax credit** (59-10-1018), worth $945 at low income and $0
  above ~$90,300, deliberately not modelled: it phases out against a different
  figure than it is computed from, so writing it as a deduction band means
  inventing a rule that appears in no document.
- **Virginia's deduction increase sunsets after 2026** and reverts to
  $3,000/$6,000 unless extended.

---

## Third sweep (2026-10-30)

Every 2026 figure marked carried, provisional, derived or estimated was
re-checked against the newest document the taxing authority has published.
A figure changed only where an official document now prints it. Each PDF was
pulled and read; web-search summaries were again wrong where tested (a
Vermont summary quoted 2018-era brackets as 2026, and an Indiana one claimed
DN #1 shows Howard at .025 — it prints .0235).

### Results

| Item                               | Before                          | After                                     | Source                                                                                                                         | Status      |
| ---------------------------------- | ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| california brackets (all statuses) | 2025 carried (11,079 / …)       | 2026 Schedules X/Y/Z (11,456 / …)         | [2026 CA Tax Rate Schedules](https://www.ftb.ca.gov/forms/2026/2026-540-tax-rate-schedules.pdf), booklet page dated 2026-10-27 | **changed** |
| california SD                      | 5,706 / 11,412                  | 5,900 / 11,800                            | [FTB Tax News, Oct 2026](https://www.ftb.ca.gov/about-ftb/newsroom/tax-news/2026/10.html)                                      | **changed** |
| connecticut exemption + brackets   | "carried"                       | unchanged — 2026 tables identical         | [CT-1040ES Rev. 01/26](https://portal.ct.gov/-/media/drs/forms/2025/income/ct1040es-flat0126.pdf) Tables A, B; OLR 2026-R-0076 | done        |
| nebraska HOH SD                    | 12,950 derived                  | unchanged — now printed                   | [2026 Form 1040N-ES](https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N-ES.pdf), line 5               | done        |
| wisconsin MFS / HOH                | "derived"                       | unchanged — printed                       | [2026 Form 1-ES instructions](https://www.revenue.wi.gov/TaxForms2026/2026-Form1-ES-inst.pdf), SD schedules + Schedules A–C    | done        |
| rhode_island SD                    | tracker said carried            | unchanged (file already on ADV 2025-22)   | [ADV 2025-22](https://tax.ri.gov/sites/g/files/xkgbur541/files/2025-11/ADV_2025_22_Inflation_Adjustments.pdf)                  | done        |
| south_carolina SD                  | tracker said carried            | unchanged (file already on Act 110 SCIAD) | [SC IL #26-20](https://dor.sc.gov/sites/dor/files/policies/IL26-20.pdf); Act 110 (H.4216)                                      | done        |
| pennsylvania / Philadelphia        | 3.74%                           | unchanged — convention confirmed          | [phila.gov wage tax table](https://www.phila.gov/services/payments-assistance-taxes/business-taxes/wage-tax-employers/)        | done        |
| oregon brackets                    | unsourced comment               | unchanged — two DOR documents agree       | OR-ESTIMATE 2026 (Rev. 10-07-25); withholding formulas 150-206-436 (Rev. 12-31-25)                                             | done        |
| oregon HOH SD / MFS cap / credit   | derived / derived / withholding | unchanged                                 | 2026 OR-40 instructions 404                                                                                                    | provisional |
| vermont brackets + SD              | IN-114 preliminary / derived    | unchanged                                 | TaxRateSched-2026, IN-111-2026 404; no 2026 PIT change in Act 164                                                              | provisional |
| washington cap-gains SD            | 278,000 carried                 | unchanged                                 | DOR table ends at 2025; due by 2026-10-31 (RCW 82.87.150)                                                                      | provisional |
| arizona SD                         | federal amounts                 | unchanged                                 | ADOR unpublished; Laws 2026 Ch. 140 indexes 43-1041(A) like the federal SD                                                     | provisional |
| arkansas SD                        | 2,470                           | unchanged                                 | 2026 AR1000F instructions 404; 2026 AR1000ES says $2,470                                                                       | provisional |
| idaho zero-rate bracket            | 4,811 / 9,622 carried           | unchanged                                 | ISTC rate schedule page ends at 2025                                                                                           | provisional |
| indiana county rates               | DN #1 R46 / 01-26               | unchanged; Boone flagged                  | DN #1 R47 / 10-26: Boone 0.0171 from 2026-10-01; no 2026 CT-40                                                                 | provisional |
| sales tax, Arizona December        | November assumed                | unchanged                                 | TPT_RATETABLE_12012026.pdf 404; all 20 cities' Nov CSV rates open-ended                                                        | provisional |
| sales tax, default spending        | IRS 2025 tables                 | unchanged                                 | no 2026 Schedule A instructions or draft                                                                                       | provisional |

California is the only state whose numbers moved. The FTB memo "Indexing,
Personal Income Tax Law, 2026 Tax Year" (2026-09-03) carries the same
schedules and surfaced first, through a CalTax copy; the FTB-hosted booklet
page above is the source the file cites. The memo footnotes that indexed
values "are subject to change if legislation passes that impacts the 2026 tax
year", so compare against the full 540 booklet in December.

### Found outside 2026

- **Oregon 2023 and 2025 brackets were 2024's — fixed 2026-10-30.** All three
  files carried single 4,300 / 10,750 and joint 8,600 / 21,500. DOR's 2025
  Publication OR-17 ("Marginal tax rates", four-year table) prints 2023 as
  4,050 / 10,200 (joint 8,100 / 20,400) and 2025 as 4,400 / 11,100 (joint
  8,800 / 22,200); only 2024 was right. Each year's OR-40 Chart S / Chart J
  value at $50,000 ($4,090 / $3,805 for 2023, $4,065 / $3,756 for 2025)
  reconciles only with the OR-17 boundaries. Both files now carry the OR-17
  figures; e2e expectations moved by the expected amounts (2023 Portland
  single at $100,000: take home −$15.99; 2025: +$9.00). `detect-suspect-figures`
  cannot see this class of error: its repeated-schedule check needs the other
  boundaries to move, and none of Oregon's do across 2023–2025.
  https://www.oregon.gov/dor/forms/FormsPubs/publication-or-17_101-431_2025.pdf
- **Nebraska's personal exemption credit was not modelled in any year — added
  2026-10-30**, with California's. See below.

### Personal exemption credits: California and Nebraska (2026-10-30)

Both now carry `personal_exemption_credit` in 2023–2026, the shape Oregon's
already used: the total for the filer, one credit for single, separate and
head of household and two for a joint return, dependents not modelled, taken
off state income tax only and never below zero.

| State / year | Status                                    | Credit (S / MFJ / MFS / HOH) | AGI threshold (S, MFS / MFJ / HOH) | Step          | Reduction / step | Source                                                                                                                                                                                                                          |
| ------------ | ----------------------------------------- | ---------------------------- | ---------------------------------- | ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA 2023      | final                                     | 144 / 288 / 144 / 144        | 237,035 / 474,075 / 355,558        | 2,500 (1,250) | $6 ($12 MFJ)     | [2023 540 booklet](https://www.ftb.ca.gov/forms/2023/2023-540-booklet.pdf), line 32 worksheet                                                                                                                                   |
| CA 2024      | final                                     | 149 / 298 / 149 / 149        | 244,857 / 489,719 / 367,291        | 2,500 (1,250) | $6 ($12 MFJ)     | [2024 540 booklet](https://www.ftb.ca.gov/forms/2024/2024-540-booklet.pdf)                                                                                                                                                      |
| CA 2025      | final                                     | 153 / 306 / 153 / 153        | 252,203 / 504,411 / 378,310        | 2,500 (1,250) | $6 ($12 MFJ)     | [2025 540 booklet](https://www.ftb.ca.gov/forms/2025/2025-540-booklet.pdf)                                                                                                                                                      |
| CA 2026      | amounts final; thresholds **provisional** | 158 / 316 / 158 / 158        | 260,778 / 521,561 / 391,173        | 2,500 (1,250) | $6 ($12 MFJ)     | [Tax News Oct 2026](https://www.ftb.ca.gov/about-ftb/newsroom/tax-news/2026/10.html) (amounts); FTB indexing memo 2026-09-03 via [CalTax](https://www.caltax.org/regulatory-issues/ftb/2026-PIT-Indexing-Memo.pdf) (thresholds) |
| NE 2023      | final                                     | 157 / 314 / 157 / 157        | none                               | —             | —                | [2023 Form 1040N](https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2023/incometax/f_1040N_2023_Final.pdf) line 18                                                                                                 |
| NE 2024      | final                                     | 166 / 332 / 166 / 166        | none                               | —             | —                | [2024 Form 1040N](https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2024/f_1040N.pdf) line 18                                                                                                                      |
| NE 2025      | final                                     | 171 / 342 / 171 / 171        | none                               | —             | —                | [2025 Form 1040N](https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N.pdf) line 18                                                                                                                      |
| NE 2026      | sourced; confirm on the 2026 1040N        | 176 / 352 / 176 / 176        | none                               | —             | —                | [Tax Rate Chronology Table 1, Rev. 2-2026](https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/4-607table1.pdf); 2026 1040N-ES                                                                             |

**California** tapers, it does not stop. The Form 540 AGI Limitation
Worksheet divides AGI over the threshold by $2,500 ($1,250 separate), rounds
up "to the next higher whole number", and multiplies $6 by that and by the
number of credits on lines 7–9 — two on a joint return, hence $12. The bands
use Connecticut's encoding of round-up steps (taper band from threshold + 1,
one step already off, running to `INFINITY` with the default floor of 0 — no
zero band, which `exemptionCreditCliffWithin` would report as an AGI cliff;
none is reported anywhere in the phase-out). Checked
against the real resolver: 1.6 million incomes across four years and four
statuses, every one equal to the worksheet. The 2026 thresholds are each the
2025 threshold × 1.034, rounded — FTB's published factor — but appear only in
the memo, which FTB has not posted; re-check against the 2026 540 booklet in
late December. The credit is exhausted well before $1,000,000, so it never
offsets the 1% surcharge folded into California's top bracket.

**Nebraska** is flat. Neb. Rev. Stat. 77-2716.01(1)(b) multiplies the year's
amount by dependants "plus two for a married filing jointly return or plus one
for any other return", with no income test; the Chronology notes the old
phase-out ended with tax year 2005.

Still not modelled, in either state: credits for dependants, and California's
blind and senior credits (Form 540 lines 8–10).
