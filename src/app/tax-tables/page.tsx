import TaxTables from "@/components/TaxTables";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { TAX_TABLES } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  pageInfoFromMetadata,
  taxTablesBreadcrumbs,
  webPageJsonLd,
} from "@/utils/structured-data";
import {
  getLandingPageData,
  getTaxTablesStatesAndCities,
} from "@/utils/get-page-data";

export default async function TaxTableLanding() {
  const data = await getLandingPageData();
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  const page = pageInfoFromMetadata(await generateMetadata());
  return (
    <Wrapper title={TAX_TABLES.name}>
      <JsonLd data={[webPageJsonLd(page), taxTablesBreadcrumbs()]} />
      <TaxTables
        {...data}
        statesAndCitiesForYear={statesAndCitiesForYear}
        heading={TAX_TABLES.name}
      />
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
