import Calculator from "@/components/Calculator";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { INCOME_TAX_CALCULATOR } from "@/constants/pages";
import type { YearPageParams, YearPageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  calculatorBreadcrumbs,
  pageInfoFromMetadata,
  webApplicationJsonLd,
} from "@/utils/structured-data";
import { getYearPageData } from "@/utils/get-page-data";
import { getYearPageParams } from "@/utils/get-page-params";

export default async function Year({ params }: YearPageProps) {
  const data = await getYearPageData(params);
  const page = pageInfoFromMetadata(await generateMetadata({ params }));
  return (
    <Wrapper title={INCOME_TAX_CALCULATOR.name}>
      <JsonLd
        data={[webApplicationJsonLd(page), calculatorBreadcrumbs(params.year)]}
      />
      <Calculator {...data} />
    </Wrapper>
  );
}

export async function generateStaticParams(): Promise<YearPageParams[]> {
  return getYearPageParams();
}

export async function generateMetadata({ params }: YearPageProps) {
  return {
    title: `${params.year} ${INCOME_TAX_CALCULATOR.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, params.year),
  };
}
