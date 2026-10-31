import Calculator from "@/components/Calculator";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { INCOME_TAX_CALCULATOR } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getLandingPageData } from "@/utils/get-page-data";
import {
  pageInfoFromMetadata,
  webApplicationJsonLd,
  webSiteJsonLd,
} from "@/utils/structured-data";

export default async function Landing() {
  const data = await getLandingPageData();
  const page = pageInfoFromMetadata(await generateMetadata());
  return (
    <Wrapper title={INCOME_TAX_CALCULATOR.name}>
      <JsonLd data={[webSiteJsonLd(), webApplicationJsonLd(page)]} />
      <Calculator {...data} heading={INCOME_TAX_CALCULATOR.name} />
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
