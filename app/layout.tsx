import type { Metadata } from "next";
import { Noto_Sans_Bengali, Noto_Serif_Bengali } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Overlays } from "@/components/Overlays";
import { getCatalog } from "@/lib/api/catalog";
import { getSiteBundle } from "@/lib/api/site";
import { CustomerAuthProvider } from "@/lib/api/auth";
import { CatalogProvider } from "@/lib/catalog";
import { StoreProvider } from "@/lib/cart";
import { SiteProvider } from "@/lib/site";
import "./globals.css";

const sans = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto",
});

const serif = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["600", "700"],
  variable: "--font-noto-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteBundle();
  return {
    title: {
      default: site.settings.metaTitle || site.settings.storeName,
      template: `%s | ${site.settings.storeName}`,
    },
    description: site.settings.metaDescription,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [catalog, site] = await Promise.all([getCatalog(), getSiteBundle()]);

  return (
    <html lang="bn" className={`${sans.variable} ${serif.variable}`}>
      <body className="m-0 overflow-x-clip bg-paper font-sans text-ink antialiased">
        <SiteProvider
          settings={site.settings}
          heroSlides={site.heroSlides}
          footerColumns={site.footerColumns}
          headerMenu={site.headerMenu}
          announcement={site.announcement}
          newsletter={site.newsletter}
          fromApi={site.fromApi}
        >
          <CatalogProvider products={catalog.products} categories={catalog.categories} fromApi={catalog.fromApi}>
            <StoreProvider>
              <CustomerAuthProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <Overlays />
              </CustomerAuthProvider>
            </StoreProvider>
          </CatalogProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
