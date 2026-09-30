"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/api/auth";
import { useSite } from "@/lib/site";
import { IconCart, IconMenu, IconSearch, IconUser } from "@/components/Icons";
import { NoApiNote } from "@/components/NoApiNote";

const farmLinks = [
  { href: "/farming/haor", label: "Haor Farm" },
  { href: "/farming/drought", label: "Drought Farm" },
  { href: "/farming/coast", label: "Coast Farm" },
  { href: "/farming/hill", label: "Hill Farm" },
  { href: "/farming/flood", label: "Flood Farm" },
];

const iconBtn =
  "relative grid h-10 w-10 place-items-center rounded-full border border-[#ddd6c6] bg-white text-green-dark hover:border-orange/50 hover:bg-cream hover:text-orange";

export function Header() {
  const pathname = usePathname();
  const { count, setCartOpen, setSearchOpen, mobileOpen, setMobileOpen } = useStore();
  const { isLoggedIn, customer, logout, authResolved } = useCustomerAuth();
  const { settings } = useSite();
  const [farmOpen, setFarmOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setFarmOpen(false);
    setAccountOpen(false);
  }, [pathname, setMobileOpen]);

  const phone = settings.phone || "09678148148";
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  return (
    <>
      <div className="bg-green-dark px-3 py-2 text-center text-[11px] leading-snug text-white/95 sm:px-4 sm:text-[13px]">
        <span className="block sm:inline">ঢাকা ও নির্বাচিত এলাকায় হোম ডেলিভারি</span>
        <span className="mx-1.5 hidden text-white/35 sm:inline">•</span>
        <span className="block sm:inline">
          অর্ডার সহায়তা:{" "}
          <a href={phoneHref} className="font-semibold text-[#f5d59c] hover:text-white">
            {phone}
          </a>
        </span>
      </div>

      <header className="sticky top-0 z-50 border-b border-[#e6e0d2] bg-[#fffdf8]/95 backdrop-blur-md">
        <div className="page-wrap flex h-[70px] items-center gap-2 sm:h-[76px] sm:gap-3">
          <button type="button" className={`${iconBtn} shrink-0 lg:hidden`} aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>
            <IconMenu />
          </button>

          <Link href="/" className="mx-auto shrink-0 lg:mx-0">
            <img src={settings.logo || "/img/logo.png"} alt={settings.storeName} className="h-10 w-auto object-contain sm:h-[48px]" />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-0.5 text-[12px] font-semibold text-green-dark lg:flex xl:gap-1 xl:text-[13.5px]"
            aria-label="Primary navigation"
          >
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/#concerns" className="hidden xl:inline-flex">
              Concerns
            </NavLink>
            <NavLink href="/#videos" className="hidden xl:inline-flex">
              Videos
            </NavLink>
            <div className="relative flex items-stretch" onMouseLeave={() => setFarmOpen(false)}>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full px-2 py-2 hover:bg-[#eef2e6] hover:text-orange xl:gap-[7px] xl:px-3"
                aria-expanded={farmOpen}
                onClick={() => setFarmOpen((open) => !open)}
                onMouseEnter={() => setFarmOpen(true)}
              >
                Farming Life
                <span className={`text-xs transition ${farmOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>
              <div
                className={`absolute top-full left-1/2 z-50 w-[210px] -translate-x-1/2 pt-2 transition ${
                  farmOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="rounded-2xl border border-[#dedfce] bg-[#fffdf8] p-2 shadow-[0_18px_40px_rgba(17,48,37,.16)]">
                  <div className="px-3 pb-1 pt-1">
                    <NoApiNote />
                  </div>
                  {farmLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block rounded-[10px] px-3 py-[11px] text-sm whitespace-nowrap hover:bg-[#eef2e6] hover:text-green-dark">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <NavLink href="/revitalization">Revitalization</NavLink>
            <NavLink href="/impact">Impact</NavLink>
            <NavLink href="/#story">আমাদের গল্প</NavLink>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
            <button type="button" className={iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <IconSearch />
            </button>
            <div className="relative max-sm:hidden" onMouseLeave={() => setAccountOpen(false)}>
              <button
                type="button"
                className={iconBtn}
                aria-label="Account"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
                onMouseEnter={() => setAccountOpen(true)}
              >
                <IconUser />
              </button>
              <div
                className={`absolute top-full right-0 z-50 w-[210px] pt-2 transition ${
                  accountOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="rounded-2xl border border-[#dedfce] bg-[#fffdf8] p-2 shadow-[0_18px_40px_rgba(17,48,37,.16)]">
                  {authResolved && isLoggedIn ? (
                    <>
                      <div className="border-b border-[#eee] px-3 py-2 text-xs text-muted">{customer?.full_name || customer?.email || customer?.phone || "Account"}</div>
                      <Link href="/dashboard" className="block rounded-[10px] px-3 py-[11px] text-sm hover:bg-[#eef2e6]">
                        Dashboard
                      </Link>
                      <Link href="/dashboard/orders" className="block rounded-[10px] px-3 py-[11px] text-sm hover:bg-[#eef2e6]">
                        Orders
                      </Link>
                      <Link href="/checkout" className="block rounded-[10px] px-3 py-[11px] text-sm hover:bg-[#eef2e6]">
                        Checkout
                      </Link>
                      <button type="button" className="block w-full rounded-[10px] px-3 py-[11px] text-left text-sm hover:bg-[#eef2e6]" onClick={() => logout()}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login?redirect=/dashboard" className="block rounded-[10px] px-3 py-[11px] text-sm hover:bg-[#eef2e6]">
                        Login
                      </Link>
                      <Link href="/auth/signup" className="block rounded-[10px] px-3 py-[11px] text-sm hover:bg-[#eef2e6]">
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button type="button" className={iconBtn} aria-label="Cart" onClick={() => setCartOpen(true)}>
              <IconCart />
              <span className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function NavLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`inline-flex rounded-full px-2 py-2 hover:bg-[#eef2e6] hover:text-orange xl:px-2.5 ${className}`}>
      {children}
    </Link>
  );
}
