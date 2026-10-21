import type { ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { z } from "zod";
import Wrapper from "@/components/Wrapper";
import { DEVELOPERS, DISCLAIMER, SITE_URL } from "@/constants/pages";
import { calculateInput, targetInput, taxTablesInput } from "@/mcp/inputs";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";

type JsonSchemaProperty = {
  type?: string;
  enum?: string[];
  default?: unknown;
  description?: string;
  items?: { type?: string };
};

type Param = {
  name: string;
  required: boolean;
  type: string;
  defaultValue?: string;
  description?: string;
};

/**
 * The parameter reference, read from the schemas the API itself validates
 * against so the page cannot drift from what the endpoints accept.
 */
function paramsOf(schema: z.ZodType): Param[] {
  const json = z.toJSONSchema(schema, { io: "input" }) as {
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
  return Object.entries(json.properties).map(([name, property]) => {
    let type = property.type ?? "";
    if (property.enum) {
      type =
        property.enum.length > 6
          ? `one of ${property.enum.length} values, e.g. ${property.enum.slice(0, 2).join(", ")}`
          : property.enum.join(" | ");
    } else if (type === "array") {
      type = `list of ${property.items?.type ?? "objects"}`;
    }
    return {
      name,
      required: json.required?.includes(name) ?? false,
      type,
      defaultValue:
        property.default === undefined
          ? undefined
          : JSON.stringify(property.default),
      description: property.description,
    };
  });
}

const TOOLS = [
  {
    name: "calculate",
    route: "/api/calculate",
    summary:
      "Take-home pay and every federal, state and local tax for an annual gross income, with per-paycheck figures, taxable income and the marginal rate.",
    example: "?income=120000&state=new_york&city=new_york_city",
    schema: calculateInput,
  },
  {
    name: "target",
    route: "/api/target",
    summary:
      "Works backwards from a take-home goal, annual or per paycheck, to the lowest gross salary that reaches it, with the full breakdown at that salary.",
    example: "?take_home=6000&target_period=monthly&state=texas",
    schema: targetInput,
  },
  {
    name: "tax_tables",
    route: "/api/tax-tables",
    summary:
      "The brackets, rates, standard deductions and 401(k) limit the calculator uses, for a year, state and optional city. Each schedule says how it is applied and what income it is charged on.",
    example: "?state=oregon&city=portland&filing_status=single",
    schema: taxTablesInput,
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 2, fontWeight: "bold" }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <Box
      component="pre"
      sx={{
        p: 2,
        my: 2,
        bgcolor: "action.hover",
        borderRadius: 1,
        overflowX: "auto",
        fontSize: "0.875rem",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      }}
    >
      <code>{children}</code>
    </Box>
  );
}

export default function Developers() {
  return (
    <Wrapper title={DEVELOPERS.name}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          textAlign="center"
          sx={{ mb: 2 }}
        >
          API &amp; MCP
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 5 }}>
          The calculator is available to AI assistants and scripts as an MCP
          server and as plain JSON URLs. It runs the same calculation as this
          site, needs no API key, and is free to use.
        </Typography>

        <Section title="MCP server">
          <Typography variant="body1">
            Add this URL as a custom connector, or remote MCP server, in Claude,
            ChatGPT, Cursor or any other MCP client. It uses Streamable HTTP and
            needs no authentication.
          </Typography>
          <CodeBlock>{`${SITE_URL}/mcp`}</CodeBlock>
          <Typography variant="body1">
            It provides three tools: <code>calculate</code>, <code>target</code>{" "}
            and <code>tax_tables</code>, described below.
          </Typography>
        </Section>

        <Section title="JSON URLs">
          <Typography variant="body1">
            Each tool is also a GET request that returns JSON, for assistants
            that can fetch a web page but do not support MCP, and for scripts.
            Lists are comma-separated: <code>exempt_taxes</code> takes{" "}
            <code>scope:tax</code> pairs such as{" "}
            <code>federal:social_security,city:city_income</code>, and{" "}
            <code>tax_types</code> takes plain keys.
          </Typography>
        </Section>

        {TOOLS.map((tool) => (
          <Section key={tool.name} title={tool.name}>
            <Typography variant="body1">{tool.summary}</Typography>
            <CodeBlock>{`GET ${SITE_URL}${tool.route}${tool.example}`}</CodeBlock>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <MuiLink href={`${tool.route}${tool.example}`} rel="nofollow">
                Try this example
              </MuiLink>
            </Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {paramsOf(tool.schema).map((param) => (
                <Box key={param.name} sx={{ mb: 2 }}>
                  <Typography component="dt" variant="body1">
                    <code>{param.name}</code>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {param.required ? "required" : "optional"}
                      {param.type && ` · ${param.type}`}
                      {param.defaultValue && ` · default ${param.defaultValue}`}
                    </Typography>
                  </Typography>
                  {param.description && (
                    <Typography
                      component="dd"
                      variant="body2"
                      sx={{ ml: 0, mt: 0.5 }}
                    >
                      {param.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Section>
        ))}

        <Section title="Errors and limits">
          <Typography variant="body1" paragraph>
            A request the API cannot answer returns HTTP 400 with an{" "}
            <code>error</code> message and, where it applies, the list of{" "}
            <code>valid_values</code>, such as the cities a state has local tax
            data for. Through MCP the same message comes back as a tool error.
          </Typography>
          <Typography variant="body1" paragraph>
            Results are estimates for a single wage earner, with the same
            simplifications as the calculator. See the{" "}
            <MuiLink component={Link} href={DISCLAIMER.route} prefetch={false}>
              disclaimer
            </MuiLink>{" "}
            before relying on them. A summary for language models is at{" "}
            <MuiLink href="/llms.txt">/llms.txt</MuiLink>.
          </Typography>
        </Section>
      </Container>
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: "API & MCP Server - Income Tax Calculator",
    ...defaultMetadata,
    ...getPageSpecificMetadata(DEVELOPERS.name),
  };
}
