import TaxTables from "@/components/TaxTables";
import Wrapper from "@/components/Wrapper";
import { TAX_TABLES } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  getLandingPageData,
  getTaxTablesStatesAndCities,
} from "@/utils/get-page-data";

export default async function TaxTableLanding() {
  const data = await getLandingPageData();
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  return (
    <Wrapper title={TAX_TABLES.name}>
      <TaxTables {...data} statesAndCitiesForYear={statesAndCitiesForYear} />
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: TAX_TABLES.name,
    ...defaultMetadata,
    ...getPageSpecificMetadata(TAX_TABLES.name),
  };
}
