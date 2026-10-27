import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomPageView, customPageMetadata } from "@/components/sections/CustomPageView";
import { getCustomPage } from "@/lib/api/sections";

/**
 * Any other URL is looked up as an ERP custom page by its slug: /privacy-policy, /about, /p/old-slug…
 * (Routes like /shop or /impact have their own folders and take priority.)
 */
type Props = { params: Promise<{ slug: string[] }> };

const pathOf = (slug: string[]) => slug.map((part) => decodeURIComponent(part)).join("/");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return customPageMetadata(await getCustomPage(pathOf(slug)));
}

export default async function CustomPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getCustomPage(pathOf(slug));
  if (!page) notFound();

  return <CustomPageView page={page} />;
}
