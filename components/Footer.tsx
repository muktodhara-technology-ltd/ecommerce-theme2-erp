"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { NoApiNote } from "@/components/NoApiNote";
import { useStore } from "@/lib/cart";
import { useSite } from "@/lib/site";
import { shopHref } from "@/lib/products";

export function Footer() {
  const { toast } = useStore();
  const { settings, footerColumns, storeName, newsletter } = useSite();

  function subscribe(event: FormEvent) {
    event.preventDefault();
    toast("ধন্যবাদ! সাবস্ক্রিপশন অনুরোধ গ্রহণ করা হয়েছে।");
    (event.target as HTMLFormElement).reset();
  }

  const phone = settings.phone || "09678148148";
  const email = settings.email || "info@deshojobazar.com";
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  return (
    <>
      {/* Newsletter band: texts from the home "newsletter" section; hidden when the admin hides it */}
      {newsletter ? (
        <section className="bg-orange py-10 text-white sm:py-12">
          <div className="page-wrap">
            <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
              <div>
                <h3 className="mb-2 font-serif text-[clamp(24px,5vw,34px)]">{newsletter.title}</h3>
                {newsletter.subtitle ? <p className="text-sm text-[#fff1e9] sm:text-base">{newsletter.subtitle}</p> : null}
              </div>
              <form className="flex rounded-full bg-white p-[5px] max-sm:flex-col max-sm:gap-2 max-sm:bg-transparent" onSubmit={subscribe}>
                <input
                  required
                  type="email"
                  placeholder={newsletter.placeholder}
                  className="min-w-0 flex-1 rounded-full px-[18px] py-3 text-ink outline-none max-sm:w-full max-sm:border max-sm:border-white/40 max-sm:bg-white"
                />
                <button className="rounded-full bg-green-dark px-[22px] py-3 font-extrabold text-white max-sm:w-full">{newsletter.buttonLabel}</button>
              </form>
            </div>
          </div>
        </section>
      ) : null}
      <footer className="bg-[#0b3026] px-0 pt-10 pb-5 text-[#ddebe4] sm:pt-[54px]">
        <div className="page-wrap">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <img src={settings.logo || "/img/logo.png"} alt={storeName} className="mb-3.5 w-[100px] rounded-2xl bg-white p-2" />
              <p className="max-w-[350px] text-[#aec1b7]">
                {settings.address
                  ? settings.address
                  : "বাংলার গ্রাম, কৃষক, ঐতিহ্য ও ঘরের স্বাদকে শহরের মানুষের কাছে সহজে পৌঁছে দেওয়ার একটি দেশজ বাজার।"}
              </p>
            </div>
            {footerColumns.length > 0 ? (
              footerColumns.slice(0, 3).map((column) => (
                <FooterCol key={column.title} title={column.title}>
                  {column.links.map((link) => (
                    <Link key={`${column.title}-${link.href}-${link.label}`} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </FooterCol>
              ))
            ) : (
              <>
                <FooterCol title="Shop">
                  <Link href="/shop">সব পণ্য</Link>
                  <Link href={shopHref("চাল")}>চাল</Link>
                  <Link href={shopHref("তেল")}>তেল</Link>
                  <Link href={shopHref("মধু")}>মধু</Link>
                </FooterCol>
                <FooterCol title="Impact">
                  <div className="mb-2">
                    <NoApiNote />
                  </div>
                  <Link href="/impact">Tahirpur Haor Initiative</Link>
                  <Link href="/impact#model">Our Adaptation Model</Link>
                  <Link href="/impact#partnership">Partnership Opportunities</Link>
                  <Link href="/#beyond">Beyond Our Products</Link>
                </FooterCol>
                <FooterCol title="Contact">
                  <a href={phoneHref}>{phone}</a>
                  <a href={`mailto:${email}`}>{email}</a>
                  <a href="https://deshojobazar.com/">deshojobazar.com</a>
                </FooterCol>
              </>
            )}
          </div>
          <div className="mt-[34px] flex justify-between gap-5 border-t border-white/10 pt-[18px] text-xs text-[#96aaa0] max-sm:flex-col">
            <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
            <span>Premium storefront for {storeName}.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="[&_a]:my-[9px] [&_a]:block [&_a]:text-sm [&_a]:text-[#bacbc2] [&_a]:hover:text-white">
      <h4 className="mb-4 text-white">{title}</h4>
      {children}
    </div>
  );
}
