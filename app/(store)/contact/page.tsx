import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { mapsEmbedUrl, mapsUrl, site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Shop Location",
  description: `Visit ${site.fullName} near Janta College Gate, Anantpur, Rewa, or call and WhatsApp us.`,
};

export default function ContactPage() {
  return (
    <div className="wrap py-9 lg:py-12">
      <h1 className="display text-4xl sm:text-5xl">Visit or message us</h1>
      <p className="mb-8 mt-3 text-lg text-muted">
        See the cameras in person, or send us your requirement on WhatsApp.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="rounded-xl border border-line bg-white p-5 sm:col-span-2">
              <PinIcon className="text-ink-3" />
              <p className="mt-2 font-bold">{site.fullName}</p>
              <address className="mt-1 not-italic leading-relaxed text-muted">
                {site.address.line1}, {site.address.line2}, {site.address.line3}
              </address>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-semibold underline decoration-signal decoration-[3px] underline-offset-4"
              >
                Get directions
              </a>
            </li>
            {site.phones.map((phone) => (
              <li key={phone.tel}>
                <a
                  href={`tel:${phone.tel}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white p-5 transition-colors hover:border-ink"
                >
                  <PhoneIcon className="text-ink-3" />
                  <span className="font-mono font-semibold">{phone.label}</span>
                </a>
              </li>
            ))}
            <li className="sm:col-span-2">
              <a
                href={whatsappUrl("Hello Krishna Enterprises, I have a question.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa w-full"
              >
                <WhatsAppIcon /> Chat on WhatsApp
              </a>
            </li>
          </ul>
          <iframe
            title={`Map showing ${site.fullName}`}
            src={mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full rounded-xl border border-line"
          />
        </div>
        <div className="on-ink h-fit rounded-2xl bg-ink p-5 sm:p-7">
          <h2 className="display mb-4 text-2xl text-white">Send an enquiry</h2>
          <EnquiryForm />
        </div>
      </div>
    </div>
  );
}
