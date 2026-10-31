import Compare from "@/components/compare/Compare";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { COMPARE } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  compareBreadcrumbs,
  pageInfoFromMetadata,
  webApplicationJsonLd,
} from "@/utils/structured-data";
import { getComparePageData } from "@/utils/get-page-data";
import { getYearPageParams } from "@/utils/get-page-params";

export default async function CompareYearPage({
  params,
}: {
  params: { year: string };
}) {
  const data = await getComparePageData(params.year);
  const page = pageInfoFromMetadata(await generateMetadata({ params }));
  return (
    <Wrapper title={`${params.year} ${COMPARE.name}`} activePage={COMPARE.name}>
      <JsonLd
        data={[webApplicationJsonLd(page), compareBreadcrumbs(params.year)]}
      />
      <Compare {...data} />
    </Wrapper>
  );
}

export async function generateStaticParams() {
  return getYearPageParams();
}

export async function generateMetadata({
  params,
}: {
  params: { year: string };
}) {
  return {
    title: `${params.year} ${COMPARE.name}`,
    ...defaultMetadata,
    ...getPageSpecificMetadata(COMPARE.name, params.year),
  };
}
