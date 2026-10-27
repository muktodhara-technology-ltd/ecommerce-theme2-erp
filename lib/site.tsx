"use client";

import { createContext, useContext, useMemo } from "react";
import type { Announcement, FooterMenuColumn, HeroSlide, NewsletterBlock, SiteSettings } from "@/lib/api/site";
import type { MenuItem } from "@/lib/api/sections";

type SiteValue = {
  settings: SiteSettings;
  heroSlides: HeroSlide[];
  footerColumns: FooterMenuColumn[];
  /** Header menu from ERP → Ecommerce → Menus (empty = theme default links). */
  headerMenu: MenuItem[];
  announcement: Announcement | null;
  newsletter: NewsletterBlock | null;
  fromApi: boolean;
  storeName: string;
};

const defaults: SiteValue = {
  settings: {
    storeName: "Deshojo Bazar",
    logo: "/img/logo.png",
    phone: "09678148148",
    email: "info@deshojobazar.com",
    address: "",
    metaTitle: "Deshojo Bazar",
    metaDescription: "Deshojo Bazar premium e-commerce storefront",
  },
  heroSlides: [],
  footerColumns: [],
  headerMenu: [],
  announcement: { text: "", link: "" },
  newsletter: null,
  fromApi: false,
  storeName: "Deshojo Bazar",
};

const SiteContext = createContext<SiteValue>(defaults);

export function SiteProvider({
  children,
  settings = defaults.settings,
  heroSlides = [],
  footerColumns = [],
  headerMenu = [],
  announcement = defaults.announcement,
  newsletter = null,
  fromApi = false,
}: {
  children: React.ReactNode;
  settings?: SiteSettings;
  heroSlides?: HeroSlide[];
  footerColumns?: FooterMenuColumn[];
  headerMenu?: MenuItem[];
  announcement?: Announcement | null;
  newsletter?: NewsletterBlock | null;
  fromApi?: boolean;
}) {
  const value = useMemo<SiteValue>(
    () => ({
      settings,
      heroSlides,
      footerColumns,
      headerMenu,
      announcement,
      newsletter,
      fromApi,
      storeName: settings.storeName || "Deshojo Bazar",
    }),
    [settings, heroSlides, footerColumns, headerMenu, announcement, newsletter, fromApi],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
