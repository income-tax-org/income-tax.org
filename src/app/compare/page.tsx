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

export default async function ComparePage() {
  const data = await getComparePageData();
  const page = pageInfoFromMetadata(await generateMetadata());
  return (
    <Wrapper title={COMPARE.name}>
      <JsonLd data={[webApplicationJsonLd(page), compareBreadcrumbs()]} />
      <Compare {...data} heading={COMPARE.name} />
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: COMPARE.name,
    ...defaultMetadata,
    ...getPageSpecificMetadata(COMPARE.name),
  };
}
