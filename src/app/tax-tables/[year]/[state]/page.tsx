import TaxTables from "@/components/TaxTables";
import Wrapper from "@/components/Wrapper";
import { TAX_TABLES } from "@/constants/pages";
import type { StatePageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  getStatePageData,
  getTaxTablesStatesAndCities,
} from "@/utils/get-page-data";
import { getStatePageParams } from "@/utils/get-page-params";
import { snakeToTitleCase } from "@/utils/string-utils";

export default async function TaxTableState({ params }: StatePageProps) {
  const data = await getStatePageData(params);
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  return (
    <Wrapper title={TAX_TABLES.name}>
      <TaxTables {...data} statesAndCitiesForYear={statesAndCitiesForYear} />
    </Wrapper>
  );
}

export async function generateStaticParams() {
  return getStatePageParams();
}

export async function generateMetadata({ params }: StatePageProps) {
  return {
    title: `${params.year} ${snakeToTitleCase(params.state)} ${TAX_TABLES.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(TAX_TABLES.name, params.year, params.state),
  };
}
