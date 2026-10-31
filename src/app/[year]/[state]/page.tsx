import Calculator from "@/components/Calculator";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { getCalculatorStateIntro } from "@/utils/get-page-intro";
import { INCOME_TAX_CALCULATOR } from "@/constants/pages";
import type { StatePageParams, StatePageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  calculatorBreadcrumbs,
  pageInfoFromMetadata,
  webApplicationJsonLd,
} from "@/utils/structured-data";
import { getStatePageData } from "@/utils/get-page-data";
import { getStatePageParams } from "@/utils/get-page-params";
import { snakeToTitleCase } from "@/utils/string-utils";

export default async function State({ params }: StatePageProps) {
  const data = await getStatePageData(params);
  const page = pageInfoFromMetadata(await generateMetadata({ params }));
  return (
    <Wrapper title={INCOME_TAX_CALCULATOR.name}>
      <JsonLd
        data={[
          webApplicationJsonLd(page),
          calculatorBreadcrumbs(params.year, params.state),
        ]}
      />
      <Calculator {...data} intro={await getCalculatorStateIntro(params)} />
    </Wrapper>
  );
}

export async function generateStaticParams(): Promise<StatePageParams[]> {
  return getStatePageParams();
}

export async function generateMetadata({ params }: StatePageProps) {
  return {
    title: `${params.year} ${snakeToTitleCase(params.state)} ${INCOME_TAX_CALCULATOR.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(
      INCOME_TAX_CALCULATOR.name,
      params.year,
      params.state,
    ),
  };
}
