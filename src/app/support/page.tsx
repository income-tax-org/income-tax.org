import Wrapper from "@/components/Wrapper";
import { CONTACT_EMAIL, SUPPORT } from "@/constants/pages";
import { Container, Link, Typography } from "@mui/material";
import { ArrowRightOutlined } from "@mui/icons-material";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { SupportButton } from "@/components/SupportButton";

function SupportItem({ text, sx }: { text: string; sx?: object }) {
  return (
    <Typography
      variant="body1"
      fontSize="large"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        mt: 1,
        textAlign: "center",
        ...sx,
      }}
    >
      <ArrowRightOutlined
        fontSize="small"
        sx={{
          mr: 1,
        }}
      />{" "}
      {text}
    </Typography>
  );
}

export default function Support() {
  return (
    <Wrapper title={SUPPORT.name}>
      <Typography variant="h2" component="h1" textAlign="center">
        Support
      </Typography>
      <Container
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <SupportItem text="Something broken?" sx={{ mt: 4 }} />
        <SupportItem text="Have a question?" />
        <SupportItem text="Want a new feature?" />
        <Typography
          variant="body1"
          fontSize="large"
          fontWeight="bold"
          sx={{
            mt: 4,
          }}
        >
          Please,
        </Typography>
        <SupportButton />
        <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
          or <Link href={`mailto:${CONTACT_EMAIL}`}>email us</Link>
        </Typography>
      </Container>
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: "Support - Income Tax Calculator",
    ...defaultMetadata,
    ...getPageSpecificMetadata(SUPPORT.name),
  };
}
