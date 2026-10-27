import { cache } from "react";
import { ApiLink } from "@/lib/api/apiLink";
import { ecommerceGet, payloadData } from "@/lib/api/server";

/**
 * A page section from the ERP (Ecommerce → Front Page → Ecommerce Sections, or a custom page's Sections).
 * `config` holds texts/settings, `content` the resolved data (products, items, categories…).
 */
export type ApiSection = {
  id: string;
  section_key: string;
  type: string | null;
  title: string | null;
  config: SectionConfig;
  content: SectionContent;
};

export type SectionItem = Record<string, unknown> & {
  title?: string;
  description?: string;
  text?: string;
  label?: string;
  image?: string;
  icon?: string;
  link?: string;
  button_label?: string;
  name?: string;
  location?: string;
  rating?: number;
  video_url?: string;
  product?: unknown;
};

export type SectionConfig = Record<string, unknown> & {
  tagline?: string;
  subtitle?: string;
  view_all_label?: string;
  view_all_link?: string;
  theme?: "default" | "light" | "dark" | "accent";
  anchor?: string;
  columns?: number;
  items?: SectionItem[];
};

export type SectionContent = Record<string, unknown> & {
  items?: SectionItem[];
  products?: unknown[];
  categories?: Record<string, unknown>[];
  banners?: Record<string, unknown>[];
  posts?: Record<string, unknown>[];
  sliders?: Record<string, unknown>[];
};

export type MenuItem = {
  name: string;
  url: string;
  sub_menu?: MenuItem[];
};

export type CustomPagePayload = {
  page: Record<string, unknown> & { page_title?: string; page_slug?: string; page_description?: string };
  template: string;
  sections: ApiSection[];
};

function toSections(value: unknown): ApiSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({
      id: String(row.id ?? row.section_key ?? ""),
      section_key: String(row.section_key ?? ""),
      type: typeof row.type === "string" ? row.type : null,
      title: typeof row.title === "string" ? row.title : null,
      config: (row.config && typeof row.config === "object" ? row.config : {}) as SectionConfig,
      content: (row.content && typeof row.content === "object" && !Array.isArray(row.content) ? row.content : {}) as SectionContent,
    }))
    .filter((section) => section.type);
}

function toMenu(value: unknown): MenuItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({
      name: String(row.name ?? "").trim(),
      url: String(row.url ?? "").trim() || "#",
      sub_menu: toMenu(row.sub_menu),
    }))
    .filter((item) => item.name);
}

/** Landing payload (home sections + header menu). Shared by the layout and the home page. */
export const getLanding = cache(async () => {
  const body = await ecommerceGet(ApiLink.ecommerceLanding, {}, 120);
  const data = payloadData(body) as Record<string, unknown> | null;
  return {
    sections: toSections(data?.sections),
    headerMenu: toMenu(data?.header_menu),
  };
});

/** A published custom page by its URL path ("impact", "farming/drought"); null when missing. */
export const getCustomPage = cache(async (path: string): Promise<CustomPagePayload | null> => {
  const body = await ecommerceGet(ApiLink.ecommerceCustomPage, { path }, 120);
  const data = payloadData(body) as Record<string, unknown> | null;
  if (!data?.page || typeof data.page !== "object") return null;
  return {
    page: data.page as CustomPagePayload["page"],
    template: String(data.template ?? "content"),
    sections: toSections(data.sections),
  };
});

/** Section pages render only when the ERP has visible sections for them. */
export function hasSections(page: CustomPagePayload | null): page is CustomPagePayload & { template: "sections" } {
  return Boolean(page && page.template === "sections" && page.sections.length);
}

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}
