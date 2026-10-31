import type { ReactNode } from "react";
import Wrapper from "@/components/Wrapper";
import { CONTACT_EMAIL, PRIVACY } from "@/constants/pages";
import { Container, Typography, Box, Link } from "@mui/material";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";

// Update this whenever the policy text below changes. A constant for the same
// reason as the disclaimer's: `new Date()` would freeze at build time.
const LAST_UPDATED = "October 30, 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
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

export default function Privacy() {
  return (
    <Wrapper title={PRIVACY.name}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Privacy Policy
        </Typography>

        <Typography variant="body1" paragraph>
          This site has no accounts, no cookies and no ads, and we don&apos;t
          sell or share information about you.
        </Typography>

        <Section title="What You Enter">
          <Typography variant="body1" paragraph>
            The calculator runs in your browser. The incomes, deductions and
            contributions you enter are used there and aren&apos;t sent to us.
          </Typography>
          <Typography variant="body1" paragraph>
            Your income is added to the page address, for example{" "}
            <code>?income=100000</code>, so you can bookmark or share a result.
            Anyone you send that link to can see the figure, and opening the
            link sends the address to our host like any other web request.
          </Typography>
        </Section>

        <Section title="Analytics">
          <Typography variant="body1" paragraph>
            We count visits with Cloudflare Web Analytics, which doesn&apos;t
            use cookies or follow you across other sites. It records things like
            the page you viewed, the site that linked you here, your browser and
            your country.
          </Typography>
        </Section>

        <Section title="Hosting">
          <Typography variant="body1" paragraph>
            The site is hosted by Cloudflare, which processes your IP address
            and request details to deliver pages and protect the site from
            abuse, under the{" "}
            <Link href="https://www.cloudflare.com/privacypolicy/">
              Cloudflare privacy policy
            </Link>
            .
          </Typography>
        </Section>

        <Section title="API and MCP Server">
          <Typography variant="body1" paragraph>
            The figures sent to the API or MCP server are used to compute the
            response and aren&apos;t stored. Cloudflare limits how many requests
            one IP address can make.
          </Typography>
        </Section>

        <Section title="Stored on Your Device">
          <Typography variant="body1" paragraph>
            Your choice of light or dark mode is saved in your browser. The
            browser also keeps copies of pages you&apos;ve visited, so the
            calculator works offline. Clearing your browser&apos;s site data
            removes both.
          </Typography>
        </Section>

        <Section title="Contact">
          <Typography variant="body1" paragraph>
            Questions about this policy?{" "}
            <Link href={`mailto:${CONTACT_EMAIL}`}>Email us</Link>. We use your
            address only to reply. Issues opened on GitHub are public.
          </Typography>
        </Section>

        <Box
          sx={{
            mt: 4,
            p: 2,
            bgcolor: "background.paper",
            borderLeft: 4,
            borderColor: "primary.main",
          }}
        >
          <Typography variant="body2" fontStyle="italic">
            Last updated: {LAST_UPDATED}
          </Typography>
        </Box>
      </Container>
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: "Privacy Policy - Income Tax Calculator",
    ...defaultMetadata,
    ...getPageSpecificMetadata(PRIVACY.name),
  };
}
