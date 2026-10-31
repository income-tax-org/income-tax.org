import Compare from "@/components/compare/Compare";
import JsonLd from "@/components/JsonLd";
import Wrapper from "@/components/Wrapper";
import { getComparePairIntro } from "@/utils/get-page-intro";
import { COMPARE } from "@/constants/pages";
import { canonicalPairOrder, comparablePairs } from "@/constants/compare-pairs";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  compareBreadcrumbs,
  pageInfoFromMetadata,
  webApplicationJsonLd,
} from "@/utils/structured-data";
import { getComparePageData } from "@/utils/get-page-data";
import { readTaxDataFromDisk } from "@/data-loaders/read-from-disk";
import {
  dashToSnakeCase,
  snakeToDashCase,
  snakeToTitleCase,
} from "@/utils/string-utils";
import path from "path";

type PairParams = { year: string; stateA: string; stateB: string };

function titleFor({ year, stateA, stateB }: PairParams) {
  return `${snakeToTitleCase(dashToSnakeCase(stateA))} vs ${snakeToTitleCase(
    dashToSnakeCase(stateB),
  )} Income Tax (${year})`;
}

export default async function ComparePairPage({
  params,
}: {
  params: PairParams;
}) {
  const data = await getComparePageData(params.year);
  const defaultLocations = [
    { state: dashToSnakeCase(params.stateA), city: "" },
    { state: dashToSnakeCase(params.stateB), city: "" },
  ];
  const page = pageInfoFromMetadata(await generateMetadata({ params }));

  return (
    <Wrapper title={titleFor(params)} activePage={COMPARE.name}>
      <JsonLd
        data={[
          webApplicationJsonLd(page),
          compareBreadcrumbs(params.year, params.stateA, params.stateB),
        ]}
      />
      <Compare
        {...data}
        defaultLocations={defaultLocations}
        canonicalPath={`${COMPARE.route}/${params.year}/${params.stateA}/vs/${params.stateB}`}
        heading={titleFor(params)}
        intro={await getComparePairIntro(params)}
      />
    </Wrapper>
  );
}

/**
 * Only the newest year, and only the curated state list. See
 * constants/compare-pairs.ts for why this is not every combination.
 */
export async function generateStaticParams(): Promise<PairParams[]> {
  const { currentYear } = await readTaxDataFromDisk(
    path.join(process.cwd(), "src", "data"),
  );
  return comparablePairs().map(({ stateA, stateB }) => ({
    year: currentYear,
    stateA: snakeToDashCase(stateA),
    stateB: snakeToDashCase(stateB),
  }));
}

export async function generateMetadata({ params }: { params: PairParams }) {
  const title = titleFor(params);
  const [first, second] = canonicalPairOrder(params.stateA, params.stateB);
  const canonical = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://income-tax.org"}${COMPARE.route}/${params.year}/${first}/vs/${second}/`;
  const description = `Compare take home pay, effective tax rate and every federal, state and local tax between ${snakeToTitleCase(
    dashToSnakeCase(params.stateA),
  )} and ${snakeToTitleCase(dashToSnakeCase(params.stateB))} for ${params.year}.`;
  const pageMetadata = getPageSpecificMetadata(COMPARE.name);
  return {
    title,
    ...defaultMetadata,
    ...pageMetadata,
    // After the spreads: both orderings of a pair exist, and this points the
    // non-alphabetical one at its twin rather than letting them compete.
    alternates: { canonical },
    description,
    openGraph: {
      ...pageMetadata.openGraph,
      title,
      description,
      url: canonical,
    },
  };
}
