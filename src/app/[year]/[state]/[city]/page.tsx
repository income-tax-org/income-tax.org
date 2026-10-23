import Calculator from "@/components/Calculator";
import Wrapper from "@/components/Wrapper";
import { INCOME_TAX_CALCULATOR } from "@/constants/pages";
import { getCityPageData } from "@/utils/get-page-data";
import type { CityPageParams, CityPageProps } from "@/types/page";
import { getCityPageParams } from "@/utils/get-page-params";
import { snakeToTitleCase } from "@/utils/string-utils";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";

export default async function City({ params }: CityPageProps) {
  const data = await getCityPageData(params);
  return (
    <Wrapper title={INCOME_TAX_CALCULATOR.name}>
      <Calculator {...data} />
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
