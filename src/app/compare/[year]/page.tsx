import Compare from "@/components/compare/Compare";
import Wrapper from "@/components/Wrapper";
import { COMPARE } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getComparePageData } from "@/utils/get-page-data";
import { getYearPageParams } from "@/utils/get-page-params";

export default async function CompareYearPage({
  params,
}: {
  params: { year: string };
}) {
  const data = await getComparePageData(params.year);
  return (
    <Wrapper title={`${params.year} ${COMPARE.name}`} activePage={COMPARE.name}>
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
    ...getPageSpecificMetadata(COMPARE.name),
  };
}
