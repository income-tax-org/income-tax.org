import TaxTables from "@/components/TaxTables";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { getTaxTablesCityIntro } from "@/utils/get-page-intro";
import { CITIES } from "@/constants";
import { TAX_TABLES } from "@/constants/pages";
import type { CityPageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  pageInfoFromMetadata,
  taxTablesBreadcrumbs,
  webPageJsonLd,
} from "@/utils/structured-data";
import {
  getCityPageData,
  getTaxTablesStatesAndCities,
} from "@/utils/get-page-data";
import { getTaxTablesCityPageParams } from "@/utils/get-page-params";
import { dashToSnakeCase, snakeToTitleCase } from "@/utils/string-utils";

export default async function TaxTableCity({ params }: CityPageProps) {
  const data = await getCityPageData(params);
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  const page = pageInfoFromMetadata(await generateMetadata({ params }));
  return (
    <Wrapper title={TAX_TABLES.name}>
      <JsonLd
        data={[
          webPageJsonLd(page),
          taxTablesBreadcrumbs(params.year, params.state, params.city),
        ]}
      />
      <TaxTables
        {...data}
        statesAndCitiesForYear={statesAndCitiesForYear}
        intro={await getTaxTablesCityIntro(params)}
      />
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
