import type { StructuredData } from "@/utils/structured-data";

/**
 * Renders schema.org JSON-LD. `<` is escaped so a value can never close the
 * script tag early.
 */
export default function JsonLd({ data }: { data: (StructuredData | null)[] }) {
  return (
    <>
      {data.filter(Boolean).map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
