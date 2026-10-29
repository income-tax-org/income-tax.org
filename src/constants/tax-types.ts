// System values
export const NONE = "none"; // No tax (e.g. states with no income)
export const STANDARD_DEDUCTION = "standard_deduction";
export const MAX_401K_CONTRIBUTION = "max_401k_contribution";
/**
 * The most federal income tax a state lets filers subtract from income, by
 * filing status -- a dollar cap, or bands that shrink it as income rises.
 * The subtraction is the smaller of the cap and the federal income tax the
 * calculator computed. Oregon's is the only one so far (ORS 316.680/316.695).
 * Data, not a tax: excluded wherever tax types are listed.
 */
export const FEDERAL_TAX_SUBTRACTION = "federal_tax_subtraction";
/**
 * A nonrefundable credit taken off the state's computed income tax, by filing
 * status -- an amount, or bands chosen by income for a credit that ends above
 * an AGI limit. Oregon's exemption credit is the only one so far (ORS
 * 316.085). Like the subtraction above it is data, not a tax.
 */
export const PERSONAL_EXEMPTION_CREDIT = "personal_exemption_credit";

/**
 * Keys in a tax-data file that configure the calculation rather than name a
 * tax: never charged, never offered as an exemption, never drawn as a table.
 */
export const NON_TAX_DATA_KEYS: string[] = [
  STANDARD_DEDUCTION,
  MAX_401K_CONTRIBUTION,
  FEDERAL_TAX_SUBTRACTION,
  PERSONAL_EXEMPTION_CREDIT,
];

// Federal
export const FEDERAL_INCOME = "federal_income";
export const SOCIAL_SECURITY = "social_security";
export const MEDICARE = "medicare";

// State
export const STATE_INCOME = "state_income";

// State specific
export const CAPITAL_GAINS = "capital_gains";
export const INTEREST_AND_DIVIDENDS = "interest_and_dividends";
export const WASHINGTON_CARES_FUND = "washington_cares_fund";
export const OREGON_TRANSIT_TAX = "oregon_transit_tax";
export const OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE =
  "oregon_paid_family_and_medical_leave";
export const CALIFORNIA_SDI = "california_sdi";
export const DC_PAID_FAMILY_LEAVE = "dc_paid_family_leave";
export const NJ_DISABILITY_INSURANCE = "nj_disability_insurance";
export const NJ_FAMILY_LEAVE_INSURANCE = "nj_family_leave_insurance";
export const NJ_UNEMPLOYMENT_INSURANCE = "nj_unemployment_insurance";
export const NJ_WORKFORCE_DEVELOPMENT = "nj_workforce_development";
export const NY_PAID_FAMILY_LEAVE = "ny_paid_family_leave";
export const NY_DISABILITY_INSURANCE = "ny_disability_insurance";
export const RI_TEMPORARY_DISABILITY_INSURANCE =
  "ri_temporary_disability_insurance";
export const HI_TEMPORARY_DISABILITY_INSURANCE =
  "hi_temporary_disability_insurance";
export const COLORADO_FAMLI = "colorado_famli";
export const CT_PAID_FAMILY_AND_MEDICAL_LEAVE =
  "ct_paid_family_and_medical_leave";

// City/County specific
export const ART_TAX = "art_tax";
export const SUPPORTIVE_HOUSING_SERVICES = "supportive_housing_services";
export const PRESCHOOL_FOR_ALL = "preschool_for_all";
export const OCCUPATIONAL_PRIVILEGE_TAX = "occupational_privilege";
export const NYC_INCOME = "nyc_income";
export const OCCUPATIONAL_TAX = "occupational_tax";
export const COUNTY_INCOME = "county_income";
export const CITY_INCOME = "city_income";
/**
 * A local payroll tax withheld from the employee. Eugene's is the only one so
 * far; it sits in `grossIncomeTaxes` and is charged on gross wages.
 *
 * Deliberately distinct from EMPLOYER_PAYROLL_TAX below, which is two
 * characters away and behaves the opposite way. Check which one you have
 * before adding data under either.
 */
export const EMPLOYEE_PAYROLL_TAX = "employee_payroll_tax";

/**
 * A local payroll tax levied on the employer, which the employee does not pay.
 * Newark's is the only one so far. Listed in NON_WAGE_TAX_TYPES, so the tax
 * tables document it and the calculator never charges it.
 *
 * Deliberately distinct from EMPLOYEE_PAYROLL_TAX above: that one is withheld
 * from the employee and *is* charged. Same words, opposite incidence.
 */
export const EMPLOYER_PAYROLL_TAX = "employer_payroll_tax";

export const LOCAL_EARNED_INCOME = "local_earned_income";

/**
 * Real taxes that the person this calculator models does not pay.
 *
 * The calculator knows about one thing: an employee's salary. These are all
 * documented in the tax tables, because they exist and a reader looking up a
 * state should see them, but charging any of them against a paycheck
 * overstates the bill. Two separate reasons land a tax here:
 *
 *  * **The base is not wages.** Washington's capital gains tax applies to
 *    long-term gains above a large standard deduction; New Hampshire's
 *    interest-and-dividends tax (repealed after 2023) applied to that income
 *    alone. Neither state taxes salary at all. Charging them cost a New
 *    Hampshire filer 4% of everything over $2,400 and a Washington filer 7%
 *    of everything over $278,000.
 *  * **The incidence is not the employee.** Newark's payroll tax *is* levied
 *    on wages, so the base is right -- but N.J.S.A. 40:48C-15 puts it on the
 *    employer, the return is filed against a FEIN, and a resident's residency
 *    reduces their employer's bill rather than creating one of their own.
 *    Charging it cost a Newark resident about $1,000 a year at $100,000.
 *    D.C.'s paid family leave is the same shape: D.C. Code 32-541.03(a) says
 *    "A covered employer shall contribute an amount equal to 0.75% of the
 *    wages of each of its covered employees to the District", and the
 *    programme's own site describes the benefit as available to employees
 *    "whose employer pays the PFL tax". Nothing is withheld from the worker.
 *    Charging it cost a DC filer $750 a year at $100,000.
 *
 * So the test for membership is not "is this levied on wages" but "would this
 * come out of the modelled employee's pay". Anything here is excluded from
 * the calculation, from the exemption picker (there is nothing to exempt from
 * a tax that is never charged) and from the bracket ladder.
 */
export const NON_WAGE_TAX_TYPES: string[] = [
  CAPITAL_GAINS,
  INTEREST_AND_DIVIDENDS,
  EMPLOYER_PAYROLL_TAX,
  DC_PAID_FAMILY_LEAVE,
];

// Sales tax. Kept in its own files, src/data/{year}/sales-tax, and never read
// by the income calculator. See src/data/README.md.
/**
 * The tax tables' key for a state's sales tax rates: the `?tables=` value on
 * the page and a `tax_types` value in the API. Not a key in any data file.
 */
export const SALES_TAX = "sales_tax";
/** The state's own general sales tax rate. */
export const STATE_SALES_TAX = "state_sales_tax";
/**
 * The local rate on top of the state's. At the top of a state file it is the
 * fallback for a location with no city picked; under [CITIES] it is that
 * city's own.
 */
export const LOCAL_SALES_TAX = "local_sales_tax";
/**
 * The state's IRS Optional Sales Tax Table, which the default taxable
 * spending is estimated from.
 */
export const TAXABLE_SPENDING = "taxable_spending";
