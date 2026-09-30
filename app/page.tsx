import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { SectionLink } from "@/components/PageHero";
import { VideoShop } from "@/components/VideoShop";
import { NoApiNote } from "@/components/NoApiNote";
import { IconLeaf, IconPhone, IconShield, IconTruck, beyondIcons } from "@/components/Icons";
import { getCatalog, getFeaturedProducts } from "@/lib/api/catalog";
import { shopCategories as fallbackShopCategories, shopHref } from "@/lib/products";

const categoryEmojis: Record<string, string> = {
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

const concerns = [
  { cat: "চাল", image: "/img/hero-rice.webp", alt: "Daily staples", title: "দৈনন্দিন স্ট্যাপলস", text: "চাল ও ঘরের নিয়মিত প্রয়োজনীয় খাবার" },
  { cat: "তেল", image: "/img/mustard-oil-5l.webp", alt: "Cooking oils", title: "বিশুদ্ধ রান্নার তেল", text: "ঘানি ভাঙ্গা ও দেশীয় রান্নার তেল" },
  { cat: "মধু", image: "/img/honey.webp", alt: "Natural sweetness", title: "প্রাকৃতিক মিষ্টতা", text: "মধু ও ঐতিহ্যবাহী মিষ্টি উপকরণ" },
  { cat: "মাংস", image: "/img/chicken.webp", alt: "Family protein", title: "পরিবারের প্রোটিন", text: "দেশী মুরগি, ডিম ও নির্বাচিত প্রোটিন" },
  { cat: "পিঠা", image: "/img/pitha.webp", alt: "Traditional foods", title: "ঐতিহ্যের স্বাদ", text: "পিঠা ও হারিয়ে যাওয়া আঞ্চলিক খাবার" },
  { cat: "ঘি", image: "/img/ghee.webp", alt: "Special cooking", title: "বিশেষ দিনের রান্না", text: "ঘি, সুগন্ধি চাল ও উৎসবের টেবিল" },
];

const beyond = [
  { n: "01", title: "উৎসের গল্প", text: "পণ্যের অঞ্চল, প্রস্তুতি ও স্থানীয় প্রেক্ষাপটকে সামনে আনা।", href: "/#farm-life", label: "Farm life →" },
  { n: "02", title: "খাদ্যঐতিহ্য", text: "হারিয়ে যেতে থাকা আঞ্চলিক স্বাদ ও পুরোনো খাবারের স্মৃতি ধরে রাখা।", href: shopHref("পিঠা"), label: "Explore heritage →" },
  { n: "03", title: "ঘরের রান্না", text: "দেশজ উপকরণকে আধুনিক পরিবারের রান্নায় সহজভাবে ফিরিয়ে আনা।", href: "/shop", label: "Shop pantry →" },
  { n: "04", title: "মানুষের সংযোগ", text: "উৎপাদক থেকে ক্রেতা খাবারের পুরো যাত্রায় আস্থা ও সম্পর্ক গড়া।", href: "/#story", label: "Our story →" },
];

const reviews = [
  { text: "প্যাকেজিং পরিষ্কার ছিল, পণ্যও ভালো অবস্থায় পেয়েছি। দেশি খাবারের জন্য সুন্দর একটা উদ্যোগ।", name: "রাফি", place: "ঢাকা" },
  { text: "ঘি আর সরিষার তেলের স্বাদ বেশ ভালো। ওয়েবসাইটে অর্ডার করা সহজ হলে নিয়মিত কেনা আরও সুবিধা হবে।", name: "নুসরাত", place: "ঢাকা" },
  { text: "পিঠা ও দইয়ের মতো আঞ্চলিক পণ্য এক জায়গায় পাওয়া এটাই সবচেয়ে ভালো লেগেছে।", name: "সাদমান", place: "নারায়ণগঞ্জ" },
];

const trustItems = [
  { icon: IconLeaf, title: "বিশ্বস্ত উৎস", text: "নির্বাচিত দেশজ পণ্য" },
  { icon: IconTruck, title: "হোম ডেলিভারি", text: "নির্বাচিত এলাকায়" },
  { icon: IconShield, title: "মান যাচাই", text: "অর্ডারের আগে বাছাই" },
  { icon: IconPhone, title: "কাস্টমার সাপোর্ট", text: "09678148148" },
];

export default async function HomePage() {
  const [catalog, featured] = await Promise.all([getCatalog(), getFeaturedProducts(8)]);
  const shopCategories =
    catalog.categories.length > 0
      ? catalog.categories.slice(0, 10).map((category) => ({
          emoji: categoryEmojis[category.name] || "🛒",
          label: category.name,
          image: category.image || "/img/hero-farm.webp",
        }))
      : fallbackShopCategories;

  return (
    <>
      <Hero />
      <section className="border-b border-line bg-cream">
        <div className="page-wrap pt-3">
          <NoApiNote />
        </div>
        <div className="page-wrap grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center justify-center gap-2.5 px-3 py-4 sm:gap-3 sm:px-[18px] sm:py-[22px]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8efe5] text-green-dark sm:h-11 sm:w-11">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <strong className="block text-xs sm:text-sm">{title}</strong>
                <span className="text-[11px] text-muted sm:text-xs">{text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="page-wrap">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Shop by category</div>
              <h2 className="mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-green-dark">আপনার ঘরের প্রয়োজন</h2>
              <p className="mt-3 max-w-[560px] text-sm text-muted sm:text-base">দৈনন্দিন চাল-ডাল থেকে ঘি, মধু, তেল, পিঠা ও দেশি খাবার এক জায়গায়।</p>
            </div>
            <SectionLink href="/shop">সব ক্যাটাগরি →</SectionLink>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-[18px] md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {shopCategories.map((category) => (
              <Link key={category.label} href={shopHref(category.label)} className="group min-w-0 text-center">
                <div className="grid aspect-square place-items-center overflow-hidden rounded-full border border-[#e7dcc0] bg-[#f3ead0] text-[26px] transition group-hover:-translate-y-1 group-hover:shadow-lift sm:text-[36px] lg:text-[42px]">
                  {category.emoji}
                </div>
                <span className="mt-2 block text-[11px] font-bold sm:mt-2.5 sm:text-sm">{category.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="concerns" className="overflow-x-clip bg-[#f1ead7] py-8 sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Shop by concerns</div>
              <h2 className="mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-green-dark">প্রয়োজন অনুযায়ী বেছে নিন</h2>
              <p className="mt-3 max-w-[560px] text-sm text-muted sm:text-base">আপনার রান্না, পরিবার ও খাবারের অভ্যাস অনুযায়ী দ্রুত সঠিক সংগ্রহে পৌঁছে যান।</p>
            </div>
            <SectionLink href="/shop">Explore all →</SectionLink>
          </div>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 pr-1 md:mr-0 md:grid md:grid-cols-2 md:gap-[18px] md:overflow-visible xl:grid-cols-3">
            {concerns.map((item, index) => (
              <Link
                key={item.title}
                href={shopHref(item.cat)}
                className="grid min-h-[140px] min-w-[78vw] snap-start grid-cols-[100px_1fr] overflow-hidden rounded-[22px] border border-[#dfd5ba] bg-[#fffdf7] transition hover:-translate-y-1 hover:shadow-lift sm:min-w-[320px] md:min-h-[150px] md:min-w-0 md:grid-cols-[110px_1fr] lg:grid-cols-[132px_1fr]"
              >
                <div className="overflow-hidden">
                  <img src={item.image} alt={item.alt} className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]" />
                </div>
                <div className="flex min-w-0 flex-col items-start justify-center px-3.5 py-3 sm:px-5 sm:py-3.5">
                  <span className="text-[11px] font-black tracking-[1px] text-orange">0{index + 1}</span>
                  <h3 className="my-1 font-serif text-[18px] leading-tight text-green-dark sm:text-[21px]">{item.title}</h3>
                  <p className="mb-2 line-clamp-2 text-[12px] leading-snug text-muted sm:mb-3 sm:text-[13px]">{item.text}</p>
                  <b className="text-xs font-bold text-green">Shop now →</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-2 py-8 sm:py-12">
        <div className="page-wrap">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Most loved</div>
              <h2 className="mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-green-dark">জনপ্রিয় দেশজ পণ্য</h2>
            </div>
            <SectionLink href="/shop">View all →</SectionLink>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="videos" className="overflow-hidden bg-[#0a3e31] py-8 text-white sm:py-12">
        <div className="page-wrap">
          <div className="mb-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-[#efb85a] uppercase">Watch & shop</div>
              <h2 className="mt-1.5 font-serif text-[clamp(32px,4vw,50px)] leading-[1.1] text-white">দেখুন, জানুন, কার্টে নিন</h2>
              <p className="mt-3 max-w-[560px] text-[#c7d8d1]">পণ্যের গল্পকে ছোট ভিডিওতে দেখুন এবং ভিডিও থেকেই সরাসরি কার্টে যোগ করুন।</p>
            </div>
            <Link href="/shop" className="font-bold whitespace-nowrap text-[#f5d59c] hover:text-white">
              Shop all products →
            </Link>
          </div>
          <VideoShop />
        </div>
      </section>

      <section id="story" className="py-8 sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <div className="grid overflow-hidden rounded-[22px] bg-green-dark text-white shadow-lift sm:rounded-[28px] lg:grid-cols-[1.06fr_0.94fr]">
            <div className="min-h-[260px] bg-cover bg-center sm:min-h-[400px] lg:min-h-[530px]" style={{ backgroundImage: "url('/img/hero-farm.webp')" }} />
            <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:p-[62px]">
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Why Deshojo</div>
              <h2 className="mt-2 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-white">মাটি থেকে আপনার টেবিলে</h2>
              <p className="text-base text-[#dde9e3]">
                আমাদের লক্ষ্য শুধু পণ্য বিক্রি নয় বাংলার স্থানীয় উৎপাদক, আঞ্চলিক খাবার ও হারিয়ে যেতে থাকা স্বাদকে আধুনিক ই-কমার্সের মাধ্যমে মানুষের কাছে পৌঁছে দেওয়া।
              </p>
              <div className="my-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {[
                  ["Source-first", "পণ্যের উৎসকে গুরুত্ব"],
                  ["Fresh selection", "স্টকভিত্তিক বাছাই"],
                  ["Local heritage", "দেশীয় স্বাদ ও ঐতিহ্য"],
                  ["Customer care", "অর্ডার সহায়তা সহজ"],
                ].map(([title, text]) => (
                  <div key={title} className="border-t border-white/20 pt-3">
                    <strong className="text-[17px]">{title}</strong>
                    <small className="mt-1 block text-[#c9d9d2]">{text}</small>
                  </div>
                ))}
              </div>
              <Link href="/shop" className="inline-flex min-h-[50px] w-fit items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white">
                দেশজ বাজার ঘুরে দেখুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="farm-life" className="bg-paper py-8 sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <div className="mb-6 grid items-end gap-4 lg:grid-cols-[1fr_0.9fr] lg:gap-[60px]">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Farm life</div>
              <h2 className="mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-green-dark">মাঠের জীবন থেকে খাবারের গল্প</h2>
            </div>
            <p className="text-sm text-muted sm:text-base">পণ্য কোথা থেকে আসে, কীভাবে তৈরি হয় এবং কোন মানুষগুলোর শ্রমে আমাদের ঘরের স্বাদ তৈরি হয় সেই গল্পগুলোকে সামনে আনা Deshojo-র অংশ।</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <article className="grid overflow-hidden rounded-[26px] border border-[#e4ddcf] bg-white lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[220px] bg-cover bg-center sm:min-h-[320px] lg:min-h-[470px]" style={{ backgroundImage: "url('/img/hero-farm.webp')" }}>
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,37,27,.55),transparent_55%)]" />
                <span className="absolute bottom-[18px] left-5 z-[2] text-[11px] font-extrabold tracking-[1.2px] text-white uppercase">Field Journal 01</span>
              </div>
              <div className="flex flex-col justify-center px-5 py-7 sm:px-[34px] sm:py-[42px]">
                <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Village stories</div>
                <h3 className="mt-[7px] mb-3.5 font-serif text-[22px] leading-tight text-green-dark sm:text-[31px]">মাটি, মৌসুম আর মানুষের হাতে শুরু</h3>
                <p className="mb-[22px] text-sm text-muted sm:text-base">ফসলের মৌসুম, স্থানীয় উৎপাদক ও আঞ্চলিক খাদ্যসংস্কৃতিকে আমরা পণ্যের পেছনের আসল গল্প হিসেবে দেখি।</p>
                <SectionLink href="/#beyond">Discover our approach →</SectionLink>
              </div>
            </article>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
              <article className="grid min-h-[160px] grid-cols-1 overflow-hidden rounded-[22px] bg-[#eef2e6] sm:min-h-[190px] sm:grid-cols-[42%_1fr] md:min-h-[225px]">
                <img src="/img/hero-rice.webp" alt="Rice field and grains" className="h-40 w-full object-cover sm:h-full" />
                <div className="flex flex-col justify-center px-5 py-5 sm:py-6">
                  <small className="font-extrabold text-orange">ধান থেকে চাল</small>
                  <h3 className="my-1 font-serif text-[19px] leading-tight text-green-dark sm:text-[21px]">শস্যের পরিচিত ঘ্রাণ</h3>
                  <p className="m-0 text-[13px] text-muted">স্থানীয় ধানের বৈচিত্র্যকে শহরের টেবিলে ফিরিয়ে আনা।</p>
                </div>
              </article>
              <article className="grid min-h-[160px] grid-cols-1 overflow-hidden rounded-[22px] bg-[#eef2e6] sm:min-h-[190px] sm:grid-cols-[42%_1fr] md:min-h-[225px]">
                <img src="/img/mustard-oil-5l.webp" alt="Mustard oil" className="h-40 w-full object-cover sm:h-full" />
                <div className="flex flex-col justify-center px-5 py-5 sm:py-6">
                  <small className="font-extrabold text-orange">কারিগরি প্রস্তুতি</small>
                  <h3 className="my-1 font-serif text-[19px] leading-tight text-green-dark sm:text-[21px]">ঘানি ভাঙ্গা তেলের স্বাদ</h3>
                  <p className="m-0 text-[13px] text-muted">বাংলার রান্নার পরিচিত সুবাসকে সহজে পৌঁছে দেওয়া।</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-2 py-8 sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <div className="grid gap-4 sm:gap-[22px] lg:grid-cols-[1.35fr_0.65fr]">
          <Link href={shopHref("চাল")} className="relative min-h-[260px] overflow-hidden rounded-3xl text-white sm:min-h-[330px] lg:min-h-[400px]" style={{ backgroundImage: "url('/img/hero-rice.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,34,25,.74),rgba(5,34,25,.05)_65%)]" />
            <div className="absolute right-4 bottom-4 left-4 z-[2] sm:right-7 sm:bottom-7 sm:left-7">
              <div className="text-xs font-extrabold tracking-[2px] text-gold uppercase">Heritage grains</div>
              <h3 className="my-1 font-serif text-[clamp(22px,4vw,30px)]">বিশুদ্ধ চাল, পরিচিত ঘ্রাণ</h3>
              <p className="m-0 text-sm text-[#eef5f1] sm:text-base">প্রতিদিনের ভাত থেকে উৎসবের পোলাও পছন্দ করুন আপনার চাল।</p>
            </div>
          </Link>
          <Link href={shopHref("পিঠা")} className="relative min-h-[260px] overflow-hidden rounded-3xl text-white sm:min-h-[330px] lg:min-h-[400px]" style={{ backgroundImage: "url('/img/pitha.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,34,25,.74),rgba(5,34,25,.05)_65%)]" />
            <div className="absolute right-4 bottom-4 left-4 z-[2] sm:right-7 sm:bottom-7 sm:left-7">
              <div className="text-xs font-extrabold tracking-[2px] text-gold uppercase">Taste of childhood</div>
              <h3 className="my-1 font-serif text-[clamp(22px,4vw,30px)]">পিঠায় ফিরে আসুক শৈশব</h3>
              <p className="m-0 text-sm text-[#eef5f1] sm:text-base">দেশজ স্বাদের ঐতিহ্যবাহী সংগ্রহ।</p>
            </div>
          </Link>
          </div>
        </div>
      </section>

      <section id="beyond" className="overflow-x-clip bg-[#e4ecdf] py-8 sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <div className="mb-8 grid items-end gap-4 lg:mb-[38px] lg:grid-cols-2 lg:gap-[70px]">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Beyond our products</div>
              <h2 className="mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-green-dark">পণ্যের বাইরেও Deshojo</h2>
            </div>
            <p className="mb-1.5 max-w-[570px] text-sm text-[#536159] sm:text-base">
              একটি অর্ডারের মূল্য শুধু প্যাকেটের ভেতরের খাবারে নয়। স্থানীয় খাদ্যঐতিহ্যকে দৃশ্যমান করা, উৎপাদকদের গল্প বলা এবং মানুষকে উৎস সম্পর্কে জানানোও আমাদের ব্র্যান্ড অভিজ্ঞতার অংশ।
            </p>
          </div>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 pr-1 sm:gap-4 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
            {beyond.map((card, index) => {
              const Icon = beyondIcons[index % beyondIcons.length];
              return (
              <article key={card.n} className="relative flex min-h-[280px] min-w-[78vw] snap-start flex-col rounded-[22px] border border-[#d2dccb] bg-[#fffdf8] p-5 transition hover:-translate-y-1 hover:shadow-lift sm:min-w-[280px] sm:p-6 md:min-h-[310px] md:min-w-0">
                <span className="absolute top-5 right-5 text-[11px] font-extrabold text-[#9da99f]">{card.n}</span>
                <div className="mb-8 grid h-[54px] w-[54px] place-items-center rounded-full bg-green-dark text-white sm:mb-10">
                  <Icon className="h-[22px] w-[22px]" />
                </div>
                <h3 className="mb-2 font-serif text-[22px] text-green-dark sm:text-2xl">{card.title}</h3>
                <p className="mb-[18px] text-sm text-muted">{card.text}</p>
                <Link href={card.href} className="mt-auto text-[13px] font-extrabold text-green">{card.label}</Link>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0a3e31] py-8 text-white sm:py-12">
        <div className="page-wrap">
          <NoApiNote className="mb-4 bg-white/15 text-[#f5d59c]" />
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div>
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Climate & community impact</div>
            <h2 className="mt-1.5 max-w-[820px] font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-white">
              In Tahirpur Haor, we are connecting Murta cultivation, Shital Pati craftsmanship and climate-resilient livelihoods.
            </h2>
            <p className="mt-3 max-w-[760px] text-sm text-[#c8d9d2] sm:text-base">
              Our community programme supports local skills and enterprise while exploring the role of Murta in erosion resilience, wetland health and biodiversity. The initiative has received support from the Adaptation Research Alliance (ARA).
            </p>
            <Link href="/impact" className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white">
              Explore the Tahirpur initiative →
            </Link>
          </div>
          <div className="hidden aspect-square w-[180px] flex-col items-center justify-center rounded-full border border-white/25 shadow-[inset_0_0_0_18px_rgba(255,255,255,.04)] lg:flex">
            <span className="text-[10px] tracking-[1.5px] text-[#f1d58f] uppercase">Field programme</span>
            <b className="font-serif text-[34px]">HAOR</b>
            <span className="text-[10px] tracking-[1.5px] text-[#f1d58f] uppercase">Tahirpur • Sunamganj</span>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e7efe8] py-8 text-center sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <p className="mx-auto max-w-[900px] px-1 font-serif text-[clamp(22px,4.5vw,47px)] leading-snug text-green-dark">
            “শুধু পণ্য নয় বাংলার মাটি, মানুষের শ্রম আর ঘরের পরিচিত স্বাদকে আমরা পৌঁছে দিতে চাই প্রতিটি অর্ডারে।”
          </p>
          <div className="mt-[18px] font-extrabold text-green">Deshojo Bazar</div>
        </div>
      </section>

      <section id="reviews" className="py-8 sm:py-12">
        <div className="page-wrap">
          <NoApiNote />
          <div className="mb-6">
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Customer love</div>
            <h2 className="mt-1.5 font-serif text-[clamp(26px,5vw,50px)] leading-[1.1] text-green-dark">মানুষ কী বলছেন</h2>
          </div>
          <div className="grid gap-4 sm:gap-[22px] md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-[18px] border border-[#e4ddcf] bg-white p-5 sm:p-7">
                <div className="tracking-wide text-[#b47b05]">★★★★★</div>
                <p className="text-sm text-[#45544a] sm:text-base">{review.text}</p>
                <strong className="mt-4 block">{review.name}</strong>
                <small className="text-muted">{review.place}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
