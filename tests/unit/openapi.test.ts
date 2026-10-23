import { describe, it, expect } from "vitest";
import { z } from "zod";
import { calculateInput, targetInput, taxTablesInput } from "@/mcp/inputs";
import { parseQuery } from "@/mcp/http";
import { buildOpenApiSpec } from "@/mcp/openapi";

const SITE = "https://income-tax.org";
const spec = buildOpenApiSpec(SITE);

type Parameter = {
  name: string;
  required: boolean;
  style?: string;
  explode?: boolean;
  schema: { type?: string; enum?: unknown[]; default?: unknown };
};
const parametersOf = (path: string) =>
  (spec.paths as Record<string, { get: { parameters: Parameter[] } }>)[path].get
    .parameters;

describe("buildOpenApiSpec", () => {
  it("describes the three GET routes on the site's own server", () => {
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.servers).toEqual([{ url: SITE }]);
    expect(Object.keys(spec.paths)).toEqual([
      "/api/calculate",
      "/api/target",
      "/api/tax-tables",
    ]);
    expect(spec.security).toEqual([]);
  });

  // The spec is generated from the schemas the routes validate with; this
  // pins that every field is described and the required ones say so.
  it.each([
    ["/api/calculate", calculateInput],
    ["/api/target", targetInput],
    ["/api/tax-tables", taxTablesInput],
  ] as const)("matches the schema for %s", (path, schema) => {
    const json = z.toJSONSchema(schema, { io: "input" }) as {
      properties: Record<string, unknown>;
      required?: string[];
    };
    const parameters = parametersOf(path);
    expect(parameters.map((p) => p.name).sort()).toEqual(
      Object.keys(json.properties).sort(),
    );
    expect(
      parameters
        .filter((p) => p.required)
        .map((p) => p.name)
        .sort(),
    ).toEqual([...(json.required ?? [])].sort());
  });

  it("carries enums and defaults through", () => {
    const filingStatus = parametersOf("/api/calculate").find(
      (p) => p.name === "filing_status",
    )!;
    expect(filingStatus.schema.enum).toContain("head_of_household");
    expect(filingStatus.schema.default).toBe("single");
  });

  // What the spec tells a client to send must be what parseQuery accepts.
  it("describes list parameters the way the routes parse them", () => {
    const taxTypes = parametersOf("/api/tax-tables").find(
      (p) => p.name === "tax_types",
    )!;
    expect(taxTypes).toMatchObject({ style: "form", explode: false });
    expect(
      parseQuery(new URLSearchParams("tax_types=state_income,city_income")),
    ).toEqual({ tax_types: ["state_income", "city_income"] });

    const exempt = parametersOf("/api/calculate").find(
      (p) => p.name === "exempt_taxes",
    )!;
    expect(exempt.schema.type).toBe("string");
    expect(
      parseQuery(new URLSearchParams("exempt_taxes=federal:social_security"))
        .exempt_taxes,
    ).toEqual([{ tax: "social_security", scope: "federal" }]);
  });
});
