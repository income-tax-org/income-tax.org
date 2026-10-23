import TaxTables from "@/components/TaxTables";
import Wrapper from "@/components/Wrapper";
import { TAX_TABLES } from "@/constants/pages";
import type { YearPageProps } from "@/types/page";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getYearPageData } from "@/utils/get-page-data";
import { getYearPageParams } from "@/utils/get-page-params";

export default async function TaxTableYear({ params }: YearPageProps) {
  const data = await getYearPageData(params);
  return (
    <Wrapper title={TAX_TABLES.name}>
      <TaxTables {...data} />
    </Wrapper>
  );
}

export async function generateStaticParams() {
  return getYearPageParams();
}

export async function generateMetadata({ params }: YearPageProps) {
  return {
    title: `${params.year} ${TAX_TABLES.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(TAX_TABLES.name, params.year),
  };
}
