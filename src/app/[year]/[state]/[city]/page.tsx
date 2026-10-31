import Calculator from "@/components/Calculator";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { getCalculatorCityIntro } from "@/utils/get-page-intro";
import { INCOME_TAX_CALCULATOR } from "@/constants/pages";
import { getCityPageData } from "@/utils/get-page-data";
import type { CityPageParams, CityPageProps } from "@/types/page";
import { getCityPageParams } from "@/utils/get-page-params";
import { snakeToTitleCase } from "@/utils/string-utils";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  calculatorBreadcrumbs,
  pageInfoFromMetadata,
  webApplicationJsonLd,
} from "@/utils/structured-data";

export default async function City({ params }: CityPageProps) {
  const data = await getCityPageData(params);
  const page = pageInfoFromMetadata(await generateMetadata({ params }));
  return (
    <Wrapper title={INCOME_TAX_CALCULATOR.name}>
      <JsonLd
        data={[
          webApplicationJsonLd(page),
          calculatorBreadcrumbs(params.year, params.state, params.city),
        ]}
      />
      <Calculator {...data} intro={await getCalculatorCityIntro(params)} />
    </Wrapper>
  );
}

export async function generateStaticParams(): Promise<CityPageParams[]> {
  return getCityPageParams();
}

export async function generateMetadata({ params }: CityPageProps) {
  return {
    title: `${params.year} ${snakeToTitleCase(params.city)}, ${snakeToTitleCase(params.state)} ${INCOME_TAX_CALCULATOR.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(
      INCOME_TAX_CALCULATOR.name,
      params.year,
      params.state,
      params.city,
    ),
  };
}
