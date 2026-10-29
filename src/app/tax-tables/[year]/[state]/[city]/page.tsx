import TaxTables from "@/components/TaxTables";
import Wrapper from "@/components/Wrapper";
import { CITIES } from "@/constants";
import { TAX_TABLES } from "@/constants/pages";
import type { CityPageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  getCityPageData,
  getTaxTablesStatesAndCities,
} from "@/utils/get-page-data";
import { getTaxTablesCityPageParams } from "@/utils/get-page-params";
import { dashToSnakeCase, snakeToTitleCase } from "@/utils/string-utils";

export default async function TaxTableCity({ params }: CityPageProps) {
  const data = await getCityPageData(params);
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  return (
    <Wrapper title={TAX_TABLES.name}>
      <TaxTables {...data} statesAndCitiesForYear={statesAndCitiesForYear} />
    </Wrapper>
  );
}

export async function generateStaticParams() {
  return getTaxTablesCityPageParams();
}

export async function generateMetadata({ params }: CityPageProps) {
  // Seattle and the like are here for their sales tax alone: no city income
  // tax to describe, and no OG image of their own.
  const { defaultStateTaxes } = await getCityPageData(params);
  const salesTaxOnly =
    !defaultStateTaxes[CITIES]?.[dashToSnakeCase(params.city)];
  return {
    title: `${params.year} ${snakeToTitleCase(params.city)}, ${snakeToTitleCase(params.state)} ${TAX_TABLES.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(
      TAX_TABLES.name,
      params.year,
      params.state,
      params.city,
      { salesTaxOnly },
    ),
  };
}
