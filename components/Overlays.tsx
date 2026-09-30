"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/api/auth";
import { useCatalog } from "@/lib/catalog";
import { ProductImage } from "@/components/ProductImage";
import { money, productHref } from "@/lib/products";

const farmLinks = [
  { href: "/farming/haor", label: "Haor Farm" },
  { href: "/farming/drought", label: "Drought Farm" },
  { href: "/farming/coast", label: "Coast Farm" },
  { href: "/farming/hill", label: "Hill Farm" },
  { href: "/farming/flood", label: "Flood Farm" },
];

export function Overlays() {
  const store = useStore();
  const backdropOpen = store.cartOpen || store.mobileOpen;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      store.closeDrawers();
      store.setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-black/35 transition ${backdropOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={store.closeDrawers}
      />
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <div
        className={`fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-[110] -translate-x-0 rounded-full bg-[#173b2f] px-4 py-3 text-center text-sm text-white shadow-lift transition sm:right-auto sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2 sm:px-[18px] ${store.toastMessage ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
      >
        {store.toastMessage}
      </div>
    </>
  );
}

function CartDrawer() {
  const { cartOpen, setCartOpen, items, changeQty, remove, subtotal } = useStore();
  const { getProduct } = useCatalog();

  return (
    <aside className={`fixed top-0 right-0 z-[90] flex h-screen w-[min(440px,94vw)] flex-col bg-white shadow-[-20px_0_50px_rgba(0,0,0,.15)] transition-transform ${cartOpen ? "translate-x-0" : "translate-x-[102%]"}`}>
      <div className="flex items-center justify-between border-b border-[#eee] px-[22px] py-[22px]">
        <h3 className="m-0">আপনার কার্ট</h3>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-[#ddd] bg-white text-xl" onClick={() => setCartOpen(false)}>
          ×
        </button>
      </div>
      <div className="flex-1 overflow-auto px-[18px]">
        {items.length === 0 ? (
          <div className="px-5 py-14 text-center text-muted">
            আপনার কার্ট খালি।
            <br />
            <br />
            <Link href="/shop" className="font-bold text-green hover:text-orange" onClick={() => setCartOpen(false)}>
              কেনাকাটা শুরু করুন →
            </Link>
          </div>
        ) : (
          items.map((line) => {
            const product = getProduct(line.id);
            if (!product) return null;
            return (
              <div key={line.id} className="grid grid-cols-[64px_1fr_auto] gap-2.5 border-b border-[#eee] py-3.5 sm:grid-cols-[78px_1fr_auto] sm:gap-3">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  size="thumb"
                  wrapClassName="h-16 w-16 overflow-hidden rounded-xl sm:h-[78px] sm:w-[78px]"
                  className="h-full w-full object-cover"
                />
                <div className="min-w-0">
                  <strong className="line-clamp-2 text-sm sm:text-base">{product.name}</strong>
                  <div className="text-sm">{money(product.price)}</div>
                  <div className="mt-[7px] flex items-center gap-2">
                    <button className="grid h-9 w-9 place-items-center rounded-full border border-[#ddd] bg-white" onClick={() => changeQty(product.id, -1)}>
                      −
                    </button>
                    <span className="min-w-5 text-center">{line.qty}</span>
                    <button className="grid h-9 w-9 place-items-center rounded-full border border-[#ddd] bg-white" onClick={() => changeQty(product.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
                <button className="self-start text-xs text-[#a33]" onClick={() => remove(product.id)}>
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>
      <div className="border-t border-[#eee] bg-white p-5">
        <div className="mb-3.5 flex justify-between font-extrabold">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <Link href="/checkout" onClick={() => setCartOpen(false)} className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(239,111,69,.25)]">
          Checkout
        </Link>
      </div>
    </aside>
  );
}

function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const { products } = useCatalog();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  const list = (!query
    ? products.slice(0, 6)
    : products.filter((product) => `${product.name}${product.en}${product.category}`.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 10);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-paper/98 p-4 sm:p-6 md:p-[34px]">
      <div className="mx-auto flex max-w-[900px] items-center gap-3">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="পণ্য খুঁজুন..."
          className="min-w-0 flex-1 border-0 border-b-2 border-green bg-transparent px-1 py-3 text-[21px] outline-none sm:text-[24px] md:py-3.5 md:text-[28px]"
        />
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#ddd] bg-white text-xl" onClick={() => setSearchOpen(false)}>
          ×
        </button>
      </div>
      <div className="mx-auto mt-7 grid max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-2">
        {list.length === 0 ? (
          <div className="col-span-full px-5 py-14 text-center text-muted">কোনো পণ্য পাওয়া যায়নি।</div>
        ) : (
          list.map((product) => (
            <Link key={product.id} href={productHref(product)} onClick={() => setSearchOpen(false)} className="flex gap-3 rounded-[14px] border border-[#e7e1d3] bg-white p-2.5">
              <ProductImage
                src={product.image}
                alt={product.name}
                size="thumb"
                wrapClassName="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px]"
                className="h-full w-full object-cover"
              />
              <div>
                <strong className="block">{product.name}</strong>
                <span className="text-[13px] text-muted">
                  {product.category} • {money(product.price)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function MobileMenu() {
  const { mobileOpen, setMobileOpen } = useStore();
  const { isLoggedIn, logout } = useCustomerAuth();
  if (!mobileOpen) return null;

  return (
    <aside className="fixed top-0 left-0 z-[95] h-screen w-[min(340px,88vw)] overflow-auto bg-white p-[22px] shadow-[20px_0_50px_rgba(0,0,0,.15)]">
      <div className="flex items-center justify-between">
        <img src="/img/logo.png" alt="Deshojo Bazar" className="w-[90px]" />
        <button className="grid h-11 w-11 place-items-center rounded-full border border-[#ddd] bg-white text-xl" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
          ×
        </button>
      </div>
      <nav className="mt-[30px] flex flex-col font-extrabold [&_a]:border-b [&_a]:border-[#eee] [&_a]:py-[13px]" aria-label="Mobile navigation">
        <Link href="/">Home</Link>
        <Link href="/shop">Shop All</Link>
        <Link href="/#concerns">Shop by Concerns</Link>
        <Link href="/#videos">Videos</Link>
        <details className="border-b border-[#eee] [&_summary]:flex [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:items-center [&_summary]:justify-between [&_summary]:py-[13px]">
          <summary>
            Farming Life <span>+</span>
          </summary>
          <div className="pb-2 pl-3.5">
            {farmLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block border-0 py-2.5 text-sm font-bold">
                {link.label}
              </Link>
            ))}
          </div>
        </details>
        <Link href="/revitalization">Revitalization</Link>
        <Link href="/#farm-life">Farm Life overview</Link>
        <Link href="/#beyond">Beyond Our Products</Link>
        <Link href="/impact">Climate & Community Impact</Link>
        <Link href="/#story">আমাদের গল্প</Link>
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link href="/dashboard/orders" onClick={() => setMobileOpen(false)}>
              Orders
            </Link>
            <button type="button" className="border-b border-[#eee] py-[13px] text-left font-extrabold" onClick={() => logout()}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login?redirect=/dashboard">Login</Link>
            <Link href="/auth/signup">Sign up</Link>
          </>
        )}
      </nav>
    </aside>
  );
}
