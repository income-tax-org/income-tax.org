import Wrapper from "@/components/Wrapper";
import { DISCLAIMER } from "@/constants/pages";
import { Container, Typography, Box } from "@mui/material";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";

// Update this whenever the disclaimer text below changes. It is deliberately a
// constant: this page is statically exported, so `new Date()` here would freeze
// at build time and report every deploy as a change to the disclaimer.
const LAST_UPDATED = "October 23, 2026";

export default function Disclaimer() {
  return (
    <Wrapper title={DISCLAIMER.name}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Disclaimer
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Not Professional Tax Advice
          </Typography>
          <Typography variant="body1" paragraph>
            The information provided by this income tax calculator is for
            general informational and educational purposes only. All tax
            calculations, rates, brackets, and other data presented on this
            website are based on information gathered through internet research
            and have not been independently verified by certified tax
            professionals or government agencies.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            No Guarantee of Accuracy
          </Typography>
          <Typography variant="body1" paragraph>
            While we strive to provide accurate and up-to-date information, we
            make no representations or warranties of any kind, express or
            implied, about the completeness, accuracy, reliability, or
            suitability of the tax calculations or information provided. Tax
            laws are complex and frequently change, and individual circumstances
            vary significantly.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            What This Calculator Simplifies
          </Typography>
          <Typography variant="body1" paragraph>
            Even where the underlying tax data is correct, the model itself
            makes simplifications you should know about:
          </Typography>
          <Box component="ul" sx={{ ml: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              <strong>One income, one earner.</strong> Wage caps such as the
              Social Security wage base, California SDI and the New York and New
              Jersey payroll programs apply per worker, but this calculator
              takes a single income figure. A married couple entering their
              combined household income has those caps applied once rather than
              once per spouse, which understates the total for two-earner
              households.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Deductions, not credits.</strong> Tax is computed from
              brackets applied to income after a standard or custom deduction.
              Credits, exemption phase-outs, dependents, and the many
              state-specific adjustments and add-backs are not modelled, with
              two exceptions: Oregon&apos;s subtraction for federal income tax
              and its personal exemption credit, counted for you and, filing
              jointly, your spouse.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Whole tax years only.</strong> Rates that change partway
              through a year are carried at whichever rate covered most of it,
              and results assume you lived and worked in the selected place for
              the full year.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Wages, not investments.</strong> Figures describe a
              salary. Taxes levied on investment income, such as Washington
              state capital gains, are documented in the tax tables but are not
              charged against your income here.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Not for Legal or Financial Decisions
          </Typography>
          <Typography variant="body1" paragraph>
            This calculator and the information it provides should NOT be used
            for:
          </Typography>
          <Box component="ul" sx={{ ml: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              Filing actual tax returns
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Making financial decisions
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Legal or tax planning purposes
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Determining actual tax liability
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Consult a Professional
          </Typography>
          <Typography variant="body1" paragraph>
            For accurate tax calculations and advice specific to your situation,
            please consult a qualified tax professional, certified public
            accountant (CPA), or tax attorney. You should also refer to official
            IRS publications and your state&apos;s department of revenue for
            authoritative information.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            Under no circumstances shall we be liable for any direct, indirect,
            incidental, special, or consequential damages that result from the
            use of, or the inability to use, the information provided by this
            calculator, even if we have been advised of the possibility of such
            damages.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            User Responsibility
          </Typography>
          <Typography variant="body1" paragraph>
            By using this calculator, you acknowledge that you understand and
            accept this disclaimer. You agree to use this tool at your own risk
            and to verify any information with official sources before making
            any decisions based on the calculations provided.
          </Typography>
        </Box>

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
    title: "Disclaimer - Income Tax Calculator",
    ...defaultMetadata,
    ...getPageSpecificMetadata(DISCLAIMER.name),
  };
}
