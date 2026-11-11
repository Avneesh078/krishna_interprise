import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry-form";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { imagePath } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "CCTV Installation & Services",
  description:
    "CCTV installation, repair and service, PoE networking and computer support in Rewa from Krishna Enterprises.",
};

const services = [
  {
    title: "CCTV installation",
    image: "dome-installation",
    text: "From a two-camera home setup to a full shop or office system.",
    points: [
      "Camera positions planned around entry points",
      "Neat wiring, power and recorder setup",
      "Mobile viewing set up on your phone",
    ],
  },
  {
    title: "Repair and service",
    image: "dynexa-smps4-views",
    text: "Bring back a system that has stopped working.",
    points: [
      "No picture or camera offline",
      "Power supply and cable faults",
      "Recorder and playback problems",
    ],
  },
  {
    title: "PoE and networking",
    image: "eyesera-poe8-details",
    text: "Clean IP camera networks with one cable per camera.",
    points: [
      "PoE switch selection and setup",
      "IP camera configuration",
      "Office network cabling",
    ],
  },
  {
    title: "Computer and IT support",
    image: "zebronics-scoot-banner",
    text: "The everyday tech help a home or small office needs.",
    points: ["Computer accessories", "Printer toner", "Wi-Fi adapters and setup help"],
  },
];

const steps = [
  { title: "Tell us the job", text: "Call, WhatsApp or fill the form below." },
  { title: "Plan and quote", text: "We work out what you need and share the price." },
  { title: "We do the work", text: "Installation or repair, at a time agreed with you." },
  { title: "Check it together", text: "We show you how it works before we leave." },
];

export default function ServicesPage() {
  return (
    <>
      <section className="on-ink grid-texture bg-ink text-white">
        <div className="wrap py-12 lg:py-16">
          <p className="eyebrow text-signal">Services in {site.city}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl sm:text-5xl">
            Installation, repair and support from your local shop
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Buying the camera is the easy part. We help with everything around it.
          </p>
        </div>
      </section>

      <section className="wrap grid gap-5 py-12 md:grid-cols-2 lg:py-16">
        {services.map((service) => (
          <article key={service.title} className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="relative aspect-[16/9] bg-white">
              <Image
                src={imagePath(service.image)}
                alt=""
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className={`object-cover ${service.image === "dome-installation" ? "object-bottom" : ""}`}
              />
            </div>
            <div className="p-6">
              <h2 className="display text-2xl">{service.title}</h2>
              <p className="mt-2 text-muted">{service.text}</p>
              <ul className="mt-4 space-y-2">
                {service.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <CheckIcon size={20} className="mt-0.5 shrink-0 text-wa" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="border-y border-line bg-white py-12 lg:py-16">
        <div className="wrap">
          <h2 className="display text-3xl sm:text-4xl">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t-2 border-ink pt-4">
                <span className="font-mono text-sm text-muted">0{index + 1}</span>
                <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                <p className="mt-1 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="enquiry" className="on-ink bg-ink text-white">
        <div className="wrap grid items-center gap-9 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Tell us what you need</h2>
            <p className="mt-3 max-w-md text-lg text-white/80">
              Your message opens in WhatsApp, ready to send. Prefer to plan parts
              yourself first?
            </p>
            <Link
              href="/kit-builder"
              className="mt-4 inline-flex items-center gap-1.5 font-semibold text-signal underline underline-offset-4"
            >
              Try the Kit Builder <ArrowIcon size={16} />
            </Link>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
