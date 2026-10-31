import CityTaxes from "@/components/CityTaxes";
import Wrapper from "@/components/Wrapper";
import { CITY_TAXES } from "@/constants/pages";
import { defaultMetadata, getPageSpecificMetadata } from "@/utils/get-metadata";
import { getCityTaxListData } from "@/utils/get-page-data";

export default async function CityTaxesPage() {
  const data = await getCityTaxListData();
  return (
    <Wrapper title={CITY_TAXES.name}>
      <CityTaxes {...data} heading={CITY_TAXES.name} />
    </Wrapper>
  );
}

export async function generateMetadata() {
  return {
    title: CITY_TAXES.name,
    ...defaultMetadata,
    ...getPageSpecificMetadata(CITY_TAXES.name),
  };
}
