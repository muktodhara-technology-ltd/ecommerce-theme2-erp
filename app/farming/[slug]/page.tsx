import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeritagePage } from "@/components/HeritagePage";
import { CustomPageView, customPageMetadata } from "@/components/sections/CustomPageView";
import { getCustomPage, hasSections } from "@/lib/api/sections";
import { farms, getFarm } from "@/lib/farms";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return farms.map((farm) => ({ slug: farm.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const farm = getFarm(slug);
  return customPageMetadata(await getCustomPage(`farming/${slug}`), {
    title: farm?.title ?? "Farming Life",
    description: farm?.description,
  });
}

export default async function FarmPage({ params }: Props) {
  const { slug } = await params;

  // ERP custom page "farming/{slug}" (Ecommerce → Custom Pages) when it exists
  const page = await getCustomPage(`farming/${slug}`);
  if (hasSections(page)) return <CustomPageView page={page} />;

  // Built-in content until the page is set up in the ERP
  const farm = getFarm(slug);
  if (!farm) {
    if (page) return <CustomPageView page={page} />;
    notFound();
  }

  return (
    <HeritagePage
      eyebrow={`Farming Life • ${farm.title}`}
      title={farm.title}
      description={farm.description}
      kicker="Farming Life"
      heading={farm.description}
      intro={farm.intro}
      cta={`Explore ${farm.title} →`}
      cards={farm.cards}
      bandTitle="Local farming knowledge belongs in the story of every product."
      bandText="Farming Life connects the products on our marketplace with the landscapes, seasons and producers behind them."
    />
  );
}
