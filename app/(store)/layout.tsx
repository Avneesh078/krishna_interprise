import { Suspense } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CatalogProvider } from "@/components/catalog-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getCatalog } from "@/lib/products";
import { site } from "@/lib/site";

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: site.fullName,
  telephone: site.phones.map((phone) => phone.tel),
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.city,
    addressRegion: "Madhya Pradesh",
    postalCode: "486001",
    addressCountry: "IN",
  },
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // Cached product list from MySQL, shared with the cart, header and kit builder.
  const products = await getCatalog();

  return (
    <CatalogProvider products={products}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      {/* Reads the current path, which on product pages is only known per request. */}
      <Suspense fallback={null}>
        <WhatsAppFab />
      </Suspense>
    </CatalogProvider>
  );
}
