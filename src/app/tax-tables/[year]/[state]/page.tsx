import TaxTables from "@/components/TaxTables";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { getTaxTablesStateIntro } from "@/utils/get-page-intro";
import { TAX_TABLES } from "@/constants/pages";
import type { StatePageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  pageInfoFromMetadata,
  taxTablesBreadcrumbs,
  webPageJsonLd,
} from "@/utils/structured-data";
import {
  getStatePageData,
  getTaxTablesStatesAndCities,
} from "@/utils/get-page-data";
import { getStatePageParams } from "@/utils/get-page-params";
import { snakeToTitleCase } from "@/utils/string-utils";

export default async function TaxTableState({ params }: StatePageProps) {
  const data = await getStatePageData(params);
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  const page = pageInfoFromMetadata(await generateMetadata({ params }));
  return (
    <Wrapper title={TAX_TABLES.name}>
      <JsonLd
        data={[
          webPageJsonLd(page),
          taxTablesBreadcrumbs(params.year, params.state),
        ]}
      />
      <TaxTables
        {...data}
        statesAndCitiesForYear={statesAndCitiesForYear}
        intro={await getTaxTablesStateIntro(params)}
      />
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
