import Compare from "@/components/compare/Compare";
import Wrapper from "@/components/Wrapper";
import { COMPARE } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getComparePageData } from "@/utils/get-page-data";

export default async function ComparePage() {
  const data = await getComparePageData();
  return (
    <Wrapper title={COMPARE.name}>
      <Compare {...data} />
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
