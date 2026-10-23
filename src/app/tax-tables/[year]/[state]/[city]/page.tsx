import TaxTables from "@/components/TaxTables";
import Wrapper from "@/components/Wrapper";
import { TAX_TABLES } from "@/constants/pages";
import type { CityPageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getCityPageData } from "@/utils/get-page-data";
import { getCityPageParams } from "@/utils/get-page-params";
import { snakeToTitleCase } from "@/utils/string-utils";

export default async function TaxTableCity({ params }: CityPageProps) {
  const data = await getCityPageData(params);
  return (
    <Wrapper title={TAX_TABLES.name}>
      <TaxTables {...data} />
    </Wrapper>
  );
}

export async function generateStaticParams() {
  return getCityPageParams();
}

export async function generateMetadata({ params }: CityPageProps) {
  return {
    title: `${params.year} ${snakeToTitleCase(params.city)}, ${snakeToTitleCase(params.state)} ${TAX_TABLES.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(
      TAX_TABLES.name,
      params.year,
      params.state,
      params.city,
    ),
  };
}
