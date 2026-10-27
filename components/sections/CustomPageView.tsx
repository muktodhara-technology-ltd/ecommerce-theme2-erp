import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { hasSections, text, type CustomPagePayload } from "@/lib/api/sections";

/** An ERP custom page: section templates render their sections, other templates their rich-text body. */
export function CustomPageView({ page }: { page: CustomPagePayload }) {
  if (hasSections(page)) return <SectionRenderer sections={page.sections} />;

  return (
    <>
      <PageHero title={text(page.page.page_title)} compact />
      <section className="py-8 sm:py-12">
        <div
          className="page-wrap max-w-[900px] text-[17px] leading-loose text-[#4e5c54] [&_a]:font-bold [&_a]:text-green [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-green-dark [&_h3]:mt-5 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:text-green-dark [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-[18px] [&_ul]:list-disc"
          // Body is written in the ERP's rich text editor
          dangerouslySetInnerHTML={{ __html: text(page.page.page_description) }}
        />
      </section>
    </>
  );
}

/** Title/description for a custom page: page banner text when the page is section-based. */
export function customPageMetadata(page: CustomPagePayload | null, fallback?: Metadata): Metadata {
  if (!page) return fallback ?? {};
  const header = page.sections.find((section) => section.type === "page_header");
  return {
    title: text(header?.title) || text(page.page.page_title) || (fallback?.title as string | undefined),
    description: text(header?.config.subtitle) || (fallback?.description as string | undefined),
  };
}
