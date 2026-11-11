import Link from "next/link";
import { categories } from "@/lib/catalog";
import { mapsUrl, site, whatsappUrl } from "@/lib/site";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="on-ink mt-auto bg-ink text-white/80">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs leading-relaxed">
            {site.tagline}. {site.lines.join(", ")} for homes, shops and offices in{" "}
            {site.city}.
          </p>
        </div>

        <div>
          <h2 className="eyebrow text-signal">Shop</h2>
          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/shop?category=${category.id}`} className="hover:text-signal">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-signal">Help</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/kit-builder" className="hover:text-signal">
                CCTV Kit Builder
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-signal">
                Installation & services
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-signal">
                Visit the shop
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-signal">Reach us</h2>
          <address className="mt-4 space-y-3 not-italic">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-signal">
              <PinIcon size={18} className="mt-0.5 shrink-0" />
              <span>
                {site.address.line1}, {site.address.line2}, {site.address.line3}
              </span>
            </a>
            {site.phones.map((phone) => (
              <a
                key={phone.tel}
                href={`tel:${phone.tel}`}
                className="flex items-center gap-2 hover:text-signal"
              >
                <PhoneIcon size={18} /> {phone.label}
              </a>
            ))}
            <a
              href={whatsappUrl("Hello Krishna Enterprises, I have a question.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-signal"
            >
              <WhatsAppIcon size={18} /> WhatsApp us
            </a>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-5 text-sm text-white/55">
          © {site.fullName}. Brand names belong to their respective owners.
        </p>
      </div>
    </footer>
  );
}
