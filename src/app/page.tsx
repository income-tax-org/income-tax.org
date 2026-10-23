import Calculator from "@/components/Calculator";
import Wrapper from "@/components/Wrapper";
import { INCOME_TAX_CALCULATOR } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getLandingPageData } from "@/utils/get-page-data";

export default async function Landing() {
  const data = await getLandingPageData();
  return (
    <Wrapper title={INCOME_TAX_CALCULATOR.name}>
      <Calculator {...data} />
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: INCOME_TAX_CALCULATOR.name,
    ...defaultMetadata,
    ...getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name),
  };
}
