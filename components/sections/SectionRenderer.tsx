import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import {
  IconCheckCircle,
  IconClock,
  IconHeart,
  IconLeaf,
  IconPhone,
  IconSeed,
  IconShield,
  IconSpark,
  IconTruck,
  beyondIcons,
  heritageIcons,
} from "@/components/Icons";
import { VideoProducts, type VideoCard } from "@/components/sections/VideoProducts";
import { resolveMediaUrl } from "@/lib/api/media";
import { normalizeApiProduct } from "@/lib/api/normalize";
import { text, type ApiSection, type SectionItem } from "@/lib/api/sections";
import { shopHref, type Product } from "@/lib/products";

/**
 * Renders ERP sections (home page and custom pages) in the theme's design.
 * Each section type maps to one block below; `config.theme` picks the background, `config.anchor` the id.
 */
export function SectionRenderer({ sections }: { sections: ApiSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section.id || section.section_key} section={section} />
      ))}
    </>
  );
}

function Section({ section }: { section: ApiSection }) {
  switch (section.type) {
    case "hero":
      return <HeroBlock section={section} />;
    case "page_header":
      return <PageHeaderBlock section={section} />;
    case "features":
      return <FeaturesBlock section={section} />;
    case "categories":
      return <CategoriesBlock section={section} />;
    case "products":
      return <ProductsBlock section={section} />;
    case "video_products":
      return <VideoBlock section={section} />;
    case "cards":
      return <CardsBlock section={section} />;
    case "banners":
      return <BannersBlock section={section} />;
    case "blog":
      return <BlogBlock section={section} />;
    case "content_banner":
      return <ContentBannerBlock section={section} />;
    case "rich_text":
      return <RichTextBlock section={section} />;
    case "steps":
      return <StepsBlock section={section} />;
    case "testimonials":
      return <TestimonialsBlock section={section} />;
    // announcement + newsletter are site-wide (header bar / band above the footer)
    default:
      return null;
  }
}

/* ---------- shared pieces ---------- */

type Theme = "default" | "light" | "dark" | "accent";

const THEME_BG: Record<Theme, string> = {
  default: "",
  light: "bg-[#edf1e7]",
  dark: "bg-[#0a3e31] text-white",
  accent: "bg-[linear-gradient(135deg,#ed7148,#cf5c37)] text-white",
};

function themeOf(section: ApiSection, fallback: Theme = "default"): Theme {
  const value = section.config.theme;
  return value && value !== "default" && value in THEME_BG ? (value as Theme) : fallback;
}

const isDarkTheme = (theme: Theme) => theme === "dark" || theme === "accent";

function Band({
  section,
  theme,
  className = "py-8 sm:py-12",
  children,
}: {
  section: ApiSection;
  theme: Theme;
  className?: string;
  children: React.ReactNode;
}) {
  const anchor = text(section.config.anchor);
  return (
    <section id={anchor || undefined} className={`${THEME_BG[theme]} ${className}`}>
      <div className="page-wrap">{children}</div>
    </section>
  );
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:|#)/i.test(href);
}

function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isExternal(href)) {
    const external = /^https?:/i.test(href);
    return (
      <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

const withArrow = (label: string) => (label.includes("→") ? label : `${label} →`);

function Eyebrow({ value, dark }: { value: string; dark: boolean }) {
  if (!value) return null;
  return <div className={`text-xs font-extrabold tracking-[2px] uppercase ${dark ? "text-[#efb85a]" : "text-orange"}`}>{value}</div>;
}

function Heading({ value, dark, as: Tag = "h2" }: { value: string; dark: boolean; as?: "h1" | "h2" }) {
  if (!value) return null;
  return (
    <Tag className={`mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] ${dark ? "text-white" : "text-green-dark"}`}>{value}</Tag>
  );
}

/** Tagline + heading + sub-heading on the left, "View all" link on the right. */
function SectionHead({ section, dark, withLink = true }: { section: ApiSection; dark: boolean; withLink?: boolean }) {
  const tagline = text(section.config.tagline);
  const title = text(section.title);
  const subtitle = text(section.config.subtitle);
  const linkLabel = text(section.config.view_all_label);
  const linkHref = text(section.config.view_all_link);
  if (!tagline && !title && !subtitle && !(withLink && linkLabel && linkHref)) return null;

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
      <div>
        <Eyebrow value={tagline} dark={dark} />
        <Heading value={title} dark={dark} />
        {subtitle ? <p className={`mt-3 max-w-[640px] text-sm sm:text-base ${dark ? "text-[#c7d8d1]" : "text-muted"}`}>{subtitle}</p> : null}
      </div>
      {withLink && linkLabel && linkHref ? (
        <SmartLink href={linkHref} className={`font-bold whitespace-nowrap ${dark ? "text-[#f5d59c] hover:text-white" : "text-green hover:text-orange"}`}>
          {withArrow(linkLabel)}
        </SmartLink>
      ) : null}
    </div>
  );
}

function Button({ label, href, variant = "solid" }: { label: string; href: string; variant?: "solid" | "outline" }) {
  if (!label || !href) return null;
  const cls =
    variant === "solid"
      ? "inline-flex min-h-[50px] w-fit items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
      : "inline-flex min-h-[50px] w-fit items-center justify-center rounded-full border border-current px-6 py-3.5 font-bold transition hover:bg-white hover:text-green-dark";
  return (
    <SmartLink href={href} className={cls}>
      {label}
    </SmartLink>
  );
}

const items = (section: ApiSection): SectionItem[] =>
  (Array.isArray(section.content.items) ? section.content.items : Array.isArray(section.config.items) ? section.config.items : []) as SectionItem[];

const image = (value: unknown) => resolveMediaUrl(value) || "";

const FEATURE_ICONS: Record<string, (props: { className?: string }) => React.ReactNode> = {
  truck: IconTruck,
  shield: IconShield,
  headphones: IconPhone,
  refresh: IconClock,
  gift: IconSeed,
  tag: IconSpark,
  "credit-card": IconCheckCircle,
  star: IconSpark,
  clock: IconClock,
  award: IconCheckCircle,
  heart: IconHeart,
};

function ItemIcon({ item, className }: { item: SectionItem; className?: string }) {
  const src = image(item.image);
  if (src) return <img src={src} alt="" className={`${className} object-contain`} />;
  const Icon = FEATURE_ICONS[text(item.icon)] || IconLeaf;
  return <Icon className={className} />;
}

/* ---------- blocks ---------- */

function HeroBlock({ section }: { section: ApiSection }) {
  const c = section.config;
  const sliders = (section.content.sliders || [])
    .map((s) => ({ image: image(s.image || s.banner_image), title: text(s.title), subtitle: text(s.description) }))
    .filter((s) => s.image);
  const buttons = [
    { label: text(c.primary_button_label), href: text(c.primary_button_link) },
    { label: text(c.secondary_button_label), href: text(c.secondary_button_link) },
  ].filter((b) => b.label && b.href);
  const title = text(section.title);

  return (
    <Hero
      tagline={text(c.tagline)}
      title={title && title !== "Hero" ? title : undefined}
      subtitle={text(c.subtitle)}
      buttons={buttons}
      slideImages={sliders}
      interval={Number(c.interval) || 5200}
      autoplay={c.autoplay !== false}
    />
  );
}

function PageHeaderBlock({ section }: { section: ApiSection }) {
  const c = section.config;
  const theme = themeOf(section, "dark");
  const dark = isDarkTheme(theme);
  const highlights = items(section);
  const bg = image(c.image);

  return (
    <section
      id={text(c.anchor) || undefined}
      className={`relative overflow-hidden ${THEME_BG[theme]} ${highlights.length ? "py-12 sm:py-16 lg:py-[85px]" : "py-10 sm:py-14"}`}
      style={bg ? { backgroundImage: `linear-gradient(90deg,rgba(7,40,30,.85),rgba(7,40,30,.45)),url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      <div className={`page-wrap relative z-[2] ${highlights.length ? "grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-[70px]" : ""}`}>
        <div>
          {text(c.tagline) ? (
            <div className={`text-[11px] font-extrabold tracking-[1.6px] uppercase sm:text-[13px] sm:tracking-[2.2px] ${dark ? "text-[#f1d58f]" : "text-orange"}`}>
              {text(c.tagline)}
            </div>
          ) : null}
          <h1 className={`mt-2.5 mb-3 font-serif text-[clamp(28px,7vw,42px)] leading-[1.08] sm:mb-[18px] sm:text-[clamp(40px,5.5vw,64px)] ${dark ? "" : "text-green-dark"}`}>
            {text(section.title)}
          </h1>
          {text(c.subtitle) ? (
            <p className={`m-0 max-w-[760px] text-[15px] leading-relaxed sm:text-lg ${dark ? "text-[#dce9e3]" : "text-muted"}`}>{text(c.subtitle)}</p>
          ) : null}
          {text(c.primary_button_label) || text(c.secondary_button_label) ? (
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button label={text(c.primary_button_label)} href={text(c.primary_button_link)} />
              <Button label={text(c.secondary_button_label)} href={text(c.secondary_button_link)} variant="outline" />
            </div>
          ) : null}
        </div>
        {highlights.length ? (
          <div className="relative max-w-[620px] rounded-[34px] border border-white/20 bg-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,.2)] backdrop-blur-md sm:p-[34px]">
            <div className="grid gap-[11px]">
              {highlights.map((item, index) => (
                <div key={index} className="border-t border-white/15 py-3 first:border-t-0">
                  <strong className="block text-sm">{text(item.title)}</strong>
                  {text(item.text) ? <span className="mt-[3px] block text-xs text-[#c8dad1]">{text(item.text)}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FeaturesBlock({ section }: { section: ApiSection }) {
  const list = items(section);
  if (!list.length) return null;
  const hasHeading = Boolean(text(section.config.tagline) || text(section.config.subtitle));

  // No heading → the slim trust strip under the hero
  if (!hasHeading) {
    return (
      <section id={text(section.config.anchor) || undefined} className="border-b border-line bg-cream">
        <div className="page-wrap grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
          {list.map((item, index) => {
            const body = (
              <div className="flex items-center justify-center gap-2.5 px-3 py-4 sm:gap-3 sm:px-[18px] sm:py-[22px]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8efe5] text-green-dark sm:h-11 sm:w-11">
                  <ItemIcon item={item} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-xs sm:text-sm">{text(item.title)}</strong>
                  <span className="text-[11px] text-muted sm:text-xs">{text(item.description)}</span>
                </div>
              </div>
            );
            return text(item.link) ? (
              <SmartLink key={index} href={text(item.link)}>
                {body}
              </SmartLink>
            ) : (
              <div key={index}>{body}</div>
            );
          })}
        </div>
      </section>
    );
  }

  // With heading → the "Why Deshojo" story card
  return (
    <section id={text(section.config.anchor) || undefined} className="py-8 sm:py-12">
      <div className="page-wrap">
        <div className="grid overflow-hidden rounded-[22px] bg-green-dark text-white shadow-lift sm:rounded-[28px] lg:grid-cols-[1.06fr_0.94fr]">
          <div className="min-h-[260px] bg-cover bg-center sm:min-h-[400px] lg:min-h-[530px]" style={{ backgroundImage: "url('/img/hero-farm.webp')" }} />
          <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:p-[62px]">
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">{text(section.config.tagline)}</div>
            <h2 className="mt-2 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-white">{text(section.title)}</h2>
            {text(section.config.subtitle) ? <p className="text-base text-[#dde9e3]">{text(section.config.subtitle)}</p> : null}
            <div className="my-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {list.map((item, index) => (
                <div key={index} className="border-t border-white/20 pt-3">
                  <strong className="text-[17px]">{text(item.title)}</strong>
                  <small className="mt-1 block text-[#c9d9d2]">{text(item.description)}</small>
                </div>
              ))}
            </div>
            <Button label={text(section.config.view_all_label)} href={text(section.config.view_all_link)} />
          </div>
        </div>
      </div>
    </section>
  );
}

const CATEGORY_EMOJIS: Record<string, string> = {
  চাল: "🍚",
  ডাল: "🥣",
  মাছ: "🐟",
  মাংস: "🍗",
  "দুধজাত পন্য": "🥛",
  ঘি: "🫙",
  মধু: "🍯",
  আলু: "🥔",
  চিনি: "🍬",
  ডিম: "🥚",
  শুটকি: "🐟",
  তেল: "🌻",
  পিঠা: "🥞",
};

function CategoriesBlock({ section }: { section: ApiSection }) {
  const categories = section.content.categories || [];
  if (!categories.length) return null;
  const theme = themeOf(section);

  return (
    <Band section={section} theme={theme}>
      <SectionHead section={section} dark={isDarkTheme(theme)} />
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-[18px] md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {categories.map((category) => {
          const name = text(category.name);
          const icon = text(category.icon);
          const picture = image(category.cat_image);
          return (
            <Link key={text(category.id) || name} href={shopHref(name)} className="group min-w-0 text-center">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-full border border-[#e7dcc0] bg-[#f3ead0] text-[26px] transition group-hover:-translate-y-1 group-hover:shadow-lift sm:text-[36px] lg:text-[42px]">
                {picture ? (
                  <img src={picture} alt={name} className="h-full w-full object-cover" />
                ) : icon && [...icon].length <= 2 ? (
                  icon
                ) : (
                  CATEGORY_EMOJIS[name] || "🛒"
                )}
              </div>
              <span className="mt-2 block text-[11px] font-bold sm:mt-2.5 sm:text-sm">{name}</span>
            </Link>
          );
        })}
      </div>
    </Band>
  );
}

function ProductsBlock({ section }: { section: ApiSection }) {
  const products = (section.content.products || []).map(normalizeApiProduct).filter((p): p is Product => Boolean(p));
  if (!products.length) return null;
  const theme = themeOf(section, "light");

  return (
    <Band section={section} theme={theme === "light" ? "default" : theme} className={`py-8 sm:py-12 ${theme === "light" ? "bg-cream-2" : ""}`}>
      <SectionHead section={section} dark={isDarkTheme(theme)} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Band>
  );
}

function VideoBlock({ section }: { section: ApiSection }) {
  const cards: VideoCard[] = items(section).map((item, index) => ({
    key: `${index}-${text(item.product_id)}`,
    label: text(item.title),
    badge: text(item.label),
    videoUrl: text(item.video_url),
    cover: image(item.image),
    product: normalizeApiProduct(item.product),
  }));
  if (!cards.length) return null;
  const theme = themeOf(section, "dark");

  return (
    <Band section={section} theme={theme} className="overflow-hidden py-8 sm:py-12">
      <SectionHead section={section} dark={isDarkTheme(theme)} />
      <VideoProducts cards={cards} />
    </Band>
  );
}

function CardsBlock({ section }: { section: ApiSection }) {
  const list = items(section);
  if (!list.length) return null;
  const theme = themeOf(section);
  const dark = isDarkTheme(theme);
  const withImages = list.some((item) => text(item.image));
  const withLabels = list.some((item) => text(item.label));
  const columns = Number(section.config.columns) || 3;

  // Image cards with labels → story layout (one large card + smaller ones), e.g. "Farm life"
  if (withImages && withLabels && columns !== 2 && list.length > 1) {
    const [first, ...rest] = list;
    return (
      <Band section={section} theme={theme === "default" ? "default" : theme} className={`py-8 sm:py-12 ${theme === "default" ? "bg-paper" : ""}`}>
        <SectionHead section={section} dark={dark} />
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="grid overflow-hidden rounded-[26px] border border-[#e4ddcf] bg-white text-ink lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[220px] bg-cover bg-center sm:min-h-[320px] lg:min-h-[470px]" style={{ backgroundImage: `url('${image(first.image)}')` }}>
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,37,27,.55),transparent_55%)]" />
            </div>
            <div className="flex flex-col justify-center px-5 py-7 sm:px-[34px] sm:py-[42px]">
              {text(first.label) ? <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">{text(first.label)}</div> : null}
              <h3 className="mt-[7px] mb-3.5 font-serif text-[22px] leading-tight text-green-dark sm:text-[31px]">{text(first.title)}</h3>
              <p className="mb-[22px] text-sm text-muted sm:text-base">{text(first.description)}</p>
              {text(first.button_label) && text(first.link) ? (
                <SmartLink href={text(first.link)} className="font-bold text-green hover:text-orange">
                  {withArrow(text(first.button_label))}
                </SmartLink>
              ) : null}
            </div>
          </article>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            {rest.map((item, index) => (
              <article key={index} className="grid min-h-[160px] grid-cols-1 overflow-hidden rounded-[22px] bg-[#eef2e6] text-ink sm:min-h-[190px] sm:grid-cols-[42%_1fr] md:min-h-[225px]">
                {text(item.image) ? <img src={image(item.image)} alt={text(item.title)} className="h-40 w-full object-cover sm:h-full" /> : <div />}
                <div className="flex flex-col justify-center px-5 py-5 sm:py-6">
                  {text(item.label) ? <small className="font-extrabold text-orange">{text(item.label)}</small> : null}
                  <h3 className="my-1 font-serif text-[19px] leading-tight text-green-dark sm:text-[21px]">{text(item.title)}</h3>
                  <p className="m-0 text-[13px] text-muted">{text(item.description)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Band>
    );
  }

  // Two big image cards with overlay text, e.g. "Heritage grains / Taste of childhood"
  if (withImages && columns === 2) {
    return (
      <Band section={section} theme={theme === "default" ? "default" : theme} className={`py-8 sm:py-12 ${theme === "default" ? "bg-cream-2" : ""}`}>
        <SectionHead section={section} dark={dark} />
        <div className="grid gap-4 sm:gap-[22px] lg:grid-cols-[1.35fr_0.65fr]">
          {list.map((item, index) => (
            <SmartLink
              key={index}
              href={text(item.link) || "/shop"}
              className="relative block min-h-[260px] overflow-hidden rounded-3xl bg-cover bg-center text-white sm:min-h-[330px] lg:min-h-[400px]"
            >
              <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${image(item.image)}')` }} />
              <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,34,25,.74),rgba(5,34,25,.05)_65%)]" />
              <span className="absolute right-4 bottom-4 left-4 z-[2] block sm:right-7 sm:bottom-7 sm:left-7">
                {text(item.label) ? <span className="block text-xs font-extrabold tracking-[2px] text-gold uppercase">{text(item.label)}</span> : null}
                <span className="my-1 block font-serif text-[clamp(22px,4vw,30px)]">{text(item.title)}</span>
                <span className="m-0 block text-sm text-[#eef5f1] sm:text-base">{text(item.description)}</span>
              </span>
            </SmartLink>
          ))}
        </div>
      </Band>
    );
  }

  // Image cards → "Shop by concerns" (image left, numbered text right)
  if (withImages) {
    return (
      <Band section={section} theme={theme === "default" ? "default" : theme} className={`overflow-x-clip py-8 sm:py-12 ${theme === "default" ? "bg-[#f1ead7]" : ""}`}>
        <SectionHead section={section} dark={dark} />
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 pr-1 md:mr-0 md:grid md:grid-cols-2 md:gap-[18px] md:overflow-visible xl:grid-cols-3">
          {list.map((item, index) => (
            <SmartLink
              key={index}
              href={text(item.link) || "/shop"}
              className="grid min-h-[140px] min-w-[78vw] snap-start grid-cols-[100px_1fr] overflow-hidden rounded-[22px] border border-[#dfd5ba] bg-[#fffdf7] text-ink transition hover:-translate-y-1 hover:shadow-lift sm:min-w-[320px] md:min-h-[150px] md:min-w-0 md:grid-cols-[110px_1fr] lg:grid-cols-[132px_1fr]"
            >
              <span className="block overflow-hidden">
                <img src={image(item.image)} alt={text(item.title)} className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]" />
              </span>
              <span className="flex min-w-0 flex-col items-start justify-center px-3.5 py-3 sm:px-5 sm:py-3.5">
                <span className="text-[11px] font-black tracking-[1px] text-orange">{String(index + 1).padStart(2, "0")}</span>
                <span className="my-1 font-serif text-[18px] leading-tight text-green-dark sm:text-[21px]">{text(item.title)}</span>
                <span className="mb-2 line-clamp-2 text-[12px] leading-snug text-muted sm:mb-3 sm:text-[13px]">{text(item.description)}</span>
                {text(item.button_label) ? <b className="text-xs font-bold text-green">{withArrow(text(item.button_label))}</b> : null}
              </span>
            </SmartLink>
          ))}
        </div>
      </Band>
    );
  }

  // No images → numbered icon cards, e.g. "Beyond our products", page points, impact model
  const icons = list.length > 4 || text(section.config.anchor) ? heritageIcons : beyondIcons;
  return (
    <Band section={section} theme={theme} className="overflow-x-clip py-8 sm:py-12">
      <SectionHead section={section} dark={dark} />
      <div className={`grid gap-4 sm:grid-cols-2 ${columns >= 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}>
        {list.map((item, index) => {
          const Icon = icons[index % icons.length];
          return (
            <article
              key={index}
              className="relative flex min-h-[230px] flex-col rounded-[22px] border border-[#d9dfd1] bg-[#fffdf8] p-5 text-ink transition hover:-translate-y-1 hover:shadow-lift sm:p-6"
            >
              <span className="absolute top-5 right-5 text-[11px] font-extrabold text-[#9da99f]">{String(index + 1).padStart(2, "0")}</span>
              <div className="mb-8 grid h-[54px] w-[54px] place-items-center rounded-full bg-green-dark text-white sm:mb-10">
                <Icon className="h-[22px] w-[22px]" />
              </div>
              {text(item.label) ? <small className="mb-1 block text-[11px] font-extrabold tracking-[1px] text-orange uppercase">{text(item.label)}</small> : null}
              <h3 className="mb-2 font-serif text-[22px] text-green-dark">{text(item.title)}</h3>
              <p className="mb-[18px] text-sm text-muted">{text(item.description)}</p>
              {text(item.link) && text(item.button_label) ? (
                <SmartLink href={text(item.link)} className="mt-auto text-[13px] font-extrabold text-green">
                  {withArrow(text(item.button_label))}
                </SmartLink>
              ) : null}
            </article>
          );
        })}
      </div>
    </Band>
  );
}

function BannersBlock({ section }: { section: ApiSection }) {
  const banners = (section.content.banners || []).filter((b) => image(b.image));
  if (!banners.length) return null;
  const columns = Math.min(Math.max(Number(section.config.columns) || 2, 1), 4);
  const theme = themeOf(section);
  const grid = ["", "", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-2 xl:grid-cols-4"][columns];

  return (
    <Band section={section} theme={theme}>
      <SectionHead section={section} dark={isDarkTheme(theme)} />
      <div className={`grid gap-4 ${grid}`}>
        {banners.map((banner, index) => {
          const pic = <img src={image(banner.image)} alt={text(banner.title)} className="h-full w-full rounded-3xl object-cover" />;
          return text(banner.link) ? (
            <SmartLink key={index} href={text(banner.link)} className="block overflow-hidden rounded-3xl">
              {pic}
            </SmartLink>
          ) : (
            <div key={index} className="overflow-hidden rounded-3xl">
              {pic}
            </div>
          );
        })}
      </div>
    </Band>
  );
}

function BlogBlock({ section }: { section: ApiSection }) {
  const posts = section.content.posts || [];
  if (!posts.length) return null;
  const theme = themeOf(section);

  return (
    <Band section={section} theme={theme}>
      <SectionHead section={section} dark={isDarkTheme(theme)} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <SmartLink
            key={text(post.id) || index}
            href={text(post.link) || `/blog/${text(post.slug)}`}
            className="overflow-hidden rounded-[22px] border border-[#e4ddcf] bg-white text-ink transition hover:-translate-y-1 hover:shadow-lift"
          >
            {image(post.image_url) ? <img src={image(post.image_url)} alt={text(post.title)} className="aspect-[16/10] w-full object-cover" /> : null}
            <span className="block p-5">
              {text(post.category_name) ? <small className="font-extrabold text-orange">{text(post.category_name)}</small> : null}
              <span className="my-1 block font-serif text-[20px] leading-tight text-green-dark">{text(post.title)}</span>
              {text(post.excerpt) ? <span className="line-clamp-3 block text-sm text-muted">{text(post.excerpt)}</span> : null}
            </span>
          </SmartLink>
        ))}
      </div>
    </Band>
  );
}

function ContentBannerBlock({ section }: { section: ApiSection }) {
  const c = section.config;
  const quote = text(c.quote);
  const title = text(section.title);
  const body = text(c.body);

  // Quote only → centred quote band
  if (quote && !title && !body) {
    return (
      <section id={text(c.anchor) || undefined} className="bg-[#e7efe8] py-8 text-center sm:py-12">
        <div className="page-wrap">
          <p className="mx-auto max-w-[900px] px-1 font-serif text-[clamp(22px,4.5vw,47px)] leading-snug text-green-dark">“{quote.replace(/^[“"]|[”"]$/g, "")}”</p>
          {text(c.quote_author) ? <div className="mt-[18px] font-extrabold text-green">{text(c.quote_author)}</div> : null}
        </div>
      </section>
    );
  }

  const theme = themeOf(section, "dark");
  const dark = isDarkTheme(theme);
  const caption = text(c.caption);
  const picture = image(c.image);

  return (
    <Band section={section} theme={theme}>
      <div className={`grid items-center gap-8 ${caption || picture ? "lg:grid-cols-[1fr_auto] lg:gap-12" : ""}`}>
        <div>
          <Eyebrow value={text(c.tagline)} dark={dark} />
          {title ? (
            <h2 className={`mt-1.5 max-w-[820px] font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] ${dark ? "text-white" : "text-green-dark"}`}>{title}</h2>
          ) : null}
          {body ? <p className={`mt-3 max-w-[760px] text-sm sm:text-base ${dark ? "text-[#e3eee9]" : "text-[#526058]"}`}>{body}</p> : null}
          {quote ? (
            <blockquote className={`mt-5 max-w-[760px] border-l-4 border-orange pl-4 font-serif text-lg ${dark ? "text-white" : "text-green-dark"}`}>
              “{quote}”{text(c.quote_author) ? <footer className="mt-1 text-sm font-bold">— {text(c.quote_author)}</footer> : null}
            </blockquote>
          ) : null}
          {text(c.button_label) && text(c.button_link) ? (
            <div className="mt-6">
              <SmartLink
                href={text(c.button_link)}
                className={`inline-flex min-h-[50px] items-center justify-center rounded-full px-6 py-3.5 font-bold ${
                  theme === "accent" ? "border border-white/70 hover:bg-white hover:text-green-dark" : "bg-orange text-white"
                }`}
              >
                {text(c.button_label)}
              </SmartLink>
            </div>
          ) : null}
        </div>
        {picture ? (
          <img src={picture} alt={title} className="w-full max-w-[420px] rounded-[26px] object-cover" />
        ) : caption ? (
          <div className="hidden aspect-square w-[200px] flex-col items-center justify-center rounded-full border border-white/25 p-4 text-center shadow-[inset_0_0_0_18px_rgba(255,255,255,.04)] lg:flex">
            {caption.split("·").map((part, index) => (
              <span key={index} className={index === 1 ? "font-serif text-[30px] font-bold" : "text-[10px] tracking-[1.5px] text-[#f1d58f] uppercase"}>
                {part.trim()}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Band>
  );
}

function RichTextBlock({ section }: { section: ApiSection }) {
  const c = section.config;
  const theme = themeOf(section);
  const dark = isDarkTheme(theme);
  const title = text(section.title);
  const tagline = text(c.tagline);
  const picture = image(c.image);
  const position = text(c.image_position) || "right";
  const body = (
    <div
      className={`text-[17px] leading-loose [&_a]:font-bold [&_a]:text-green [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-[18px] [&_ul]:list-disc ${
        dark ? "text-[#e3eee9] [&_a]:text-[#f5d59c] [&_h2]:text-white [&_h3]:text-white" : "text-[#4e5c54] [&_h2]:text-green-dark [&_h3]:text-green-dark [&_strong]:text-green-dark"
      }`}
      // HTML is sanitised by the ERP when the section is saved
      dangerouslySetInnerHTML={{ __html: text(c.body) }}
    />
  );
  const button =
    text(c.button_label) && text(c.button_link) ? (
      <div className="mt-2">
        <Button label={withArrow(text(c.button_label))} href={text(c.button_link)} />
      </div>
    ) : null;

  return (
    <Band section={section} theme={theme}>
      {picture && position === "top" ? <img src={picture} alt={title} className="mb-8 max-h-[420px] w-full rounded-[26px] object-cover" /> : null}
      <div className={`grid items-start gap-5 ${title || tagline || (picture && position !== "top") ? "lg:grid-cols-[0.82fr_1.18fr] lg:gap-[90px]" : ""}`}>
        {title || tagline || (picture && position === "left") ? (
          <div>
            <Eyebrow value={tagline} dark={dark} />
            {title ? (
              <h2 className={`mt-2 font-serif text-[clamp(32px,4vw,52px)] leading-[1.08] ${dark ? "text-white" : "text-green-dark"}`}>{title}</h2>
            ) : null}
            {picture && position === "left" ? <img src={picture} alt={title} className="mt-6 w-full rounded-[26px] object-cover" /> : null}
          </div>
        ) : null}
        <div className="max-w-[860px]">
          {body}
          {button}
          {picture && position === "right" ? <img src={picture} alt={title} className="mt-6 w-full rounded-[26px] object-cover" /> : null}
        </div>
      </div>
    </Band>
  );
}

function StepsBlock({ section }: { section: ApiSection }) {
  const list = items(section);
  const chips = Array.isArray(section.config.chips) ? (section.config.chips as unknown[]).map(text).filter(Boolean) : [];
  if (!list.length && !chips.length) return null;
  const theme = themeOf(section, "dark");
  const dark = isDarkTheme(theme);

  return (
    <Band section={section} theme={theme}>
      <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[70px]">
        <div>
          <Eyebrow value={text(section.config.tagline)} dark={dark} />
          <Heading value={text(section.title)} dark={dark} />
          {text(section.config.subtitle) ? (
            <p className={`mt-4 text-[15px] leading-relaxed sm:text-[17px] ${dark ? "text-[#d6e5de]" : "text-muted"}`}>{text(section.config.subtitle)}</p>
          ) : null}
          {chips.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${dark ? "border-white/25 text-[#f1d58f]" : "border-[#d9dfd1] text-green-dark"}`}>
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <ol className="grid gap-2">
          {list.map((item, index) => (
            <li key={index} className="list-none">
              <div className={`rounded-2xl border p-4 ${dark ? "border-white/15 bg-white/5" : "border-[#d9dfd1] bg-white"}`}>
                <strong className="block">{text(item.title)}</strong>
                {text(item.text) ? <span className={`mt-1 block text-sm ${dark ? "text-[#c8dad1]" : "text-muted"}`}>{text(item.text)}</span> : null}
              </div>
              {index < list.length - 1 ? <div className={`py-1 text-center ${dark ? "text-[#f1d58f]" : "text-orange"}`}>↓</div> : null}
            </li>
          ))}
        </ol>
      </div>
    </Band>
  );
}

function TestimonialsBlock({ section }: { section: ApiSection }) {
  const list = items(section);
  if (!list.length) return null;
  const theme = themeOf(section);

  return (
    <Band section={section} theme={theme}>
      <SectionHead section={section} dark={isDarkTheme(theme)} />
      <div className="grid gap-4 sm:gap-[22px] md:grid-cols-2 lg:grid-cols-3">
        {list.map((review, index) => {
          const rating = Math.min(Math.max(Number(review.rating) || 5, 1), 5);
          return (
            <article key={index} className="rounded-[18px] border border-[#e4ddcf] bg-white p-5 text-ink sm:p-7">
              <div className="tracking-wide text-[#b47b05]">{"★".repeat(rating)}</div>
              <p className="text-sm text-[#45544a] sm:text-base">{text(review.text)}</p>
              <div className="mt-4 flex items-center gap-3">
                {image(review.image) ? <img src={image(review.image)} alt={text(review.name)} className="h-10 w-10 rounded-full object-cover" /> : null}
                <div>
                  <strong className="block">{text(review.name)}</strong>
                  <small className="text-muted">{text(review.location)}</small>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Band>
  );
}
