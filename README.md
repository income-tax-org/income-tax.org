# [Income Tax Calculator](https://income-tax.org/)

This is the open source repository for [income-tax.org](https://income-tax.org/), a comprehensive income tax calculator for the United States.

## Features

- Calculates USA federal, state, and city-level income tax
- Accounts for city-specific taxes (like Portland, OR), unlike other online calculators
- Includes a [list of US cities](https://income-tax.org/city-taxes/) with specific income taxes
- Progressive Web App (PWA) - works offline and can be installed on your device
- [JSON API and MCP server](#api-and-mcp-server) so LLMs and scripts can run the same calculations

## API and MCP server

Three tools, each available as a plain GET URL and as an MCP tool:

- **calculate** — taxes and take-home pay for an annual gross income.
- **target** — the gross income needed to reach a take-home goal, annual or per paycheck.
- **tax_tables** — the brackets, rates, standard deductions and 401(k) limit the calculator uses (`/api/tax-tables`).

### MCP

Add `https://income-tax.org/mcp` as a remote MCP server (Streamable HTTP, no auth) in Claude, ChatGPT, or any MCP client.

Full parameter docs are at [income-tax.org/developers](https://income-tax.org/developers/), and a summary for language models at [/llms.txt](https://income-tax.org/llms.txt).

### GET URLs

```
https://income-tax.org/api/calculate?income=120000&state=new_york&city=new_york_city&retirement_contribution=10000
https://income-tax.org/api/target?take_home=6000&target_period=monthly&state=texas
https://income-tax.org/api/tax-tables?state=oregon&city=portland&filing_status=single
```

| Parameter                                | Default     | Notes                                                                                          |
| ---------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `income`                                 | —           | `calculate` only. Annual gross dollars.                                                        |
| `take_home`, `target_period`             | —, `annual` | `target` only. `target_period` is `annual`, `weekly`, `biweekly`, `semi_monthly` or `monthly`. |
| `state`                                  | —           | Required. snake_case, e.g. `new_york`.                                                         |
| `city`                                   | none        | City or county with local taxes, e.g. `portland`.                                              |
| `year`                                   | latest      | Tax year.                                                                                      |
| `filing_status`                          | `single`    | `single`, `married`, `married_separately`, `head_of_household`.                                |
| `retirement_contribution`                | `0`         | Pre-tax 401(k)/IRA dollars. Capped at the year's 401(k) limit.                                 |
| `federal_deductions`, `state_deductions` | standard    | Custom deduction totals.                                                                       |
| `exempt_taxes`                           | none        | `scope:tax` pairs, e.g. `federal:social_security,city:city_income`.                            |
| `pay_frequency`                          | `monthly`   | Used for the per-paycheck figures.                                                             |

`tax_tables` takes only `year`, `state` (optional; omit for federal only), `city`, `filing_status` (optional; omit for all four) and `tax_types` (comma-separated, e.g. `state_income,city_income`). Each schedule is labelled with its `kind` (marginal, rate on total, base plus rate, flat fee) and the income `basis` it is charged on.

Bad input returns a 400 listing the valid values. Results are estimates, not tax advice.

## Contributing

If your city isn't included and you'd like to add it, see the [src/data/README.md](./src/data/README.md).
