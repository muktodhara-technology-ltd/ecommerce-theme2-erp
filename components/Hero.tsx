"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NoApiNote } from "@/components/NoApiNote";
import { useSite } from "@/lib/site";

const fallbackSlides = ["/img/hero-farm.webp", "/img/hero-rice.webp", "/img/hero-brown-rice.webp"];

export function Hero() {
  const { heroSlides } = useSite();
  const slides = useMemo(
    () => (heroSlides.length ? heroSlides.map((slide) => slide.image) : fallbackSlides),
    [heroSlides],
  );
  const fromApi = heroSlides.length > 0;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [slides]);

  const activeMeta = heroSlides[index];

  return (
    <section className="relative min-h-[480px] overflow-hidden bg-cream sm:min-h-[560px] lg:min-h-[620px]">
      {!fromApi ? (
        <div className="absolute top-3 left-3 z-[4] sm:top-4 sm:left-4">
          <NoApiNote />
        </div>
      ) : null}
      {slides.map((src, slideIndex) => (
        <div
          key={`${src}-${slideIndex}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${slideIndex === index ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url('${src}')` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,40,30,.78)_0%,rgba(7,40,30,.45)_42%,rgba(7,40,30,.04)_72%)] max-sm:bg-[linear-gradient(180deg,rgba(7,40,30,.72)_0%,rgba(7,40,30,.55)_55%,rgba(7,40,30,.35)_100%)]" />
        </div>
      ))}
      <div className="page-wrap relative z-[2] py-16 text-white sm:py-24 sm:pt-[100px] lg:py-[90px] lg:pt-[120px]">
        <div className="max-w-[610px]">
          <div className="mb-3 text-[11px] font-extrabold tracking-[1.8px] text-gold uppercase sm:mb-3.5 sm:text-[13px] sm:tracking-[2.2px]">
            From village to your table
          </div>
          <h1 className="mb-4 font-serif text-[clamp(32px,9vw,44px)] leading-[1.05] font-bold sm:mb-[18px] sm:text-[clamp(42px,6vw,78px)] sm:leading-[1.03]">
            {activeMeta?.title ? (
              activeMeta.title
            ) : (
              <>
                দেশজ খাবার,
                <br />
                শেকড়ের স্বাদ
              </>
            )}
          </h1>
          <p className="mb-6 max-w-[540px] text-[15px] leading-relaxed text-[#f3f4ef] sm:mb-[30px] sm:text-lg">
            {activeMeta?.subtitle || "বাংলার মাঠ, কৃষক ও ঐতিহ্যের নির্বাচিত খাবার বিশ্বস্ত উৎস থেকে আপনার ঘরে।"}
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-2">
            <Link
              href="/shop"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(239,111,69,.25)] sm:min-h-[50px]"
            >
              Shop Now →
            </Link>
            <Link
              href="/#story"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white px-6 py-3.5 font-bold text-white transition hover:bg-white hover:text-green-dark sm:min-h-[50px]"
            >
              আমাদের গল্প
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 z-[3] flex -translate-x-1/2 gap-1 sm:bottom-7 sm:gap-2">
        {slides.map((src, slideIndex) => (
          <button
            key={`${src}-dot-${slideIndex}`}
            aria-label={`Slide ${slideIndex + 1}`}
            className="grid h-10 w-10 place-items-center sm:h-8 sm:w-8"
            onClick={() => setIndex(slideIndex)}
          >
            <span className={`h-2.5 w-2.5 rounded-full border border-white ${slideIndex === index ? "bg-white" : "bg-transparent"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
