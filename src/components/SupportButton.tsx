"use client";

import { Button } from "@mui/material";
import MuiLink from "@mui/material/Link";
import Link from "next/link";

type SupportButtonProps = {
  asLink?: boolean;
};

export function SupportButton({ asLink }: SupportButtonProps) {
  const href =
    process.env.NEXT_PUBLIC_NEW_REPO_ISSUE_LINK ||
    "https://github.com/income-tax-org/income-tax.org/issues";
  if (asLink) {
    return (
      <MuiLink color="inherit" component={Link} href={href}>
        check the issues on GitHub
      </MuiLink>
    );
  }
  return (
    <Button
      sx={{
        mt: 1,
      }}
      variant="contained"
      component={Link}
      href={href}
    >
      View issues on GitHub
    </Button>
  );
}
