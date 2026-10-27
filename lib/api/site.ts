import { cache } from "react";
import { ApiLink } from "@/lib/api/apiLink";
import { resolveMediaUrl } from "@/lib/api/media";
import { getLanding, text, type ApiSection, type MenuItem } from "@/lib/api/sections";
import { ecommerceGet, payloadData } from "@/lib/api/server";

export type SiteSettings = {
  storeName: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
};

export type FooterMenuColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type HeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
};

/** Top bar text (home "announcement" section). */
export type Announcement = { text: string; link: string };

/** Newsletter band shown above the footer (home "newsletter" section). */
export type NewsletterBlock = { title: string; subtitle: string; placeholder: string; buttonLabel: string };

export type SiteBundle = {
  settings: SiteSettings;
  heroSlides: HeroSlide[];
  footerColumns: FooterMenuColumn[];
  headerMenu: MenuItem[];
  /** null = section hidden/missing in the ERP; undefined values fall back to the theme defaults */
  announcement: Announcement | null;
  newsletter: NewsletterBlock | null;
  fromApi: boolean;
};

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: "Deshojo Bazar",
  logo: "/img/logo.png",
  phone: "09678148148",
  email: "info@deshojobazar.com",
  address: "",
  metaTitle: "Deshojo Bazar",
  metaDescription: "Deshojo Bazar premium e-commerce storefront",
};

function pickSettings(raw: Record<string, unknown> | null | undefined, logoFallback = ""): SiteSettings {
  const settings = (raw?.settings && typeof raw.settings === "object" ? raw.settings : raw) as Record<string, unknown> | null;
  if (!settings) {
    return {
      ...DEFAULT_SETTINGS,
      logo: resolveMediaUrl(logoFallback) || DEFAULT_SETTINGS.logo,
    };
  }

  const logo =
    resolveMediaUrl(settings.logo) ||
    resolveMediaUrl(raw?.ecommerce_logo) ||
    resolveMediaUrl(logoFallback) ||
    DEFAULT_SETTINGS.logo;

  return {
    storeName: String(settings.store_name || settings.storeName || DEFAULT_SETTINGS.storeName).trim() || DEFAULT_SETTINGS.storeName,
    logo,
    phone: String(settings.phone || DEFAULT_SETTINGS.phone).trim() || DEFAULT_SETTINGS.phone,
    email: String(settings.email || DEFAULT_SETTINGS.email).trim() || DEFAULT_SETTINGS.email,
    address: String(settings.address || "").trim(),
    metaTitle: String(settings.meta_title || settings.store_name || DEFAULT_SETTINGS.metaTitle),
    metaDescription: String(settings.meta_description || DEFAULT_SETTINGS.metaDescription),
  };
}

function mapHeroSlides(landing: Record<string, unknown> | null): HeroSlide[] {
  if (!landing) return [];
  const sliders = Array.isArray(landing.hero_sliders) ? landing.hero_sliders : [];
  const banners = Array.isArray(landing.banners) ? landing.banners : [];
  const source = sliders.length ? sliders : banners;
  const slides: HeroSlide[] = [];
  for (const item of source) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const image = resolveMediaUrl(record.image || record.banner_image || record.desktop_image);
    if (!image) continue;
    const title = String(record.title || record.heading || "").trim();
    const subtitle = String(record.subtitle || record.description || "").trim();
    slides.push({
      image,
      ...(title ? { title } : {}),
      ...(subtitle ? { subtitle } : {}),
    });
  }
  return slides;
}

function mapFooterMenus(payload: unknown): FooterMenuColumn[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const columns: FooterMenuColumn[] = [];
  const keys = [
    "footer_menus",
    "footer_menus1",
    "footer_menus2",
    "footer_menus3",
    "footer_menus4",
    "footer_menus5",
    "footer_menus6",
    "footer_menus7",
  ];

  for (const key of keys) {
    const group = root[key];
    if (!Array.isArray(group) || !group.length) continue;

    const first = group[0] && typeof group[0] === "object" ? (group[0] as Record<string, unknown>) : null;
    const title =
      String(first?.title || first?.name || first?.label || first?.menu_title || "").trim() || "Links";

    const rawItems = group.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const record = row as Record<string, unknown>;
      return Array.isArray(record.items) ? record.items : [row];
    });

    const links = rawItems
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const label = String(record.name || record.title || record.label || record.menu_name || "").trim();
        const href = String(record.url || record.href || record.link || record.menu_url || "").trim();
        if (!label || !href) return null;
        return { label, href };
      })
      .filter((item): item is { label: string; href: string } => Boolean(item));

    if (links.length) columns.push({ title, links });
  }

  return columns;
}

const DEFAULT_ANNOUNCEMENT: Announcement = { text: "", link: "" };
const DEFAULT_NEWSLETTER: NewsletterBlock = {
  title: "দেশজ স্বাদের খবর আগে জানুন",
  subtitle: "নতুন পণ্য, মৌসুমি সংগ্রহ ও বিশেষ অফারের আপডেট পান।",
  placeholder: "আপনার ইমেইল",
  buttonLabel: "Subscribe",
};

/**
 * Announcement / newsletter come from the home sections. When the ERP sends sections but not this one,
 * the admin hid it (null); with no sections at all (API down / not set up) the theme default is used.
 */
function pickAnnouncement(sections: ApiSection[]): Announcement | null {
  if (!sections.length) return DEFAULT_ANNOUNCEMENT;
  const section = sections.find((s) => s.type === "announcement");
  if (!section) return null;
  return { text: text(section.config.text), link: text(section.config.link) };
}

function pickNewsletter(sections: ApiSection[]): NewsletterBlock | null {
  if (!sections.length) return DEFAULT_NEWSLETTER;
  const section = sections.find((s) => s.type === "newsletter");
  if (!section) return null;
  return {
    title: text(section.title) || DEFAULT_NEWSLETTER.title,
    subtitle: text(section.config.subtitle),
    placeholder: text(section.config.placeholder) || DEFAULT_NEWSLETTER.placeholder,
    buttonLabel: text(section.config.button_label) || DEFAULT_NEWSLETTER.buttonLabel,
  };
}

async function fetchSiteBundleUncached(): Promise<SiteBundle> {
  const [landingBody, settingsBody, footerBody, landingSections] = await Promise.all([
    ecommerceGet(ApiLink.ecommerceLanding, {}, 120),
    ecommerceGet(ApiLink.ecommerceSettings, {}, 120),
    ecommerceGet(ApiLink.ecommerceFooterMenus, {}, 120),
    getLanding(),
  ]);

  const landing = payloadData(landingBody) as Record<string, unknown> | null;
  const settingsRaw = payloadData(settingsBody) as Record<string, unknown> | null;
  const footerRaw = payloadData(footerBody);

  const settings = pickSettings(
    (settingsRaw as Record<string, unknown>) || (landing as Record<string, unknown>),
    typeof landing?.ecommerce_logo === "string" ? landing.ecommerce_logo : "",
  );

  const heroSlides = mapHeroSlides(landing);
  const footerColumns = mapFooterMenus(footerRaw);

  return {
    settings,
    heroSlides,
    footerColumns,
    headerMenu: landingSections.headerMenu,
    announcement: pickAnnouncement(landingSections.sections),
    newsletter: pickNewsletter(landingSections.sections),
    fromApi: Boolean(landingBody || settingsBody),
  };
}

export const getSiteBundle = cache(fetchSiteBundleUncached);

export async function getProductsByCategorySlug(categorySlug: string, categoryId?: string) {
  const body = await ecommerceGet(
    ApiLink.ecommerceProductsByCategorySlug,
    {
      category_slug: categorySlug,
      category_id: categoryId,
    },
    60,
  );
  return body;
}

export async function getCategoriesByTags(tags: string) {
  const body = await ecommerceGet(ApiLink.ecommerceCategoriesByTags, { tags }, 60);
  return body;
}

export async function getOffersStorefront() {
  const body = await ecommerceGet(ApiLink.ecommerceOffersStorefront, {}, 60);
  return payloadData(body);
}
