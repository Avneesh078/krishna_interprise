import Image from "next/image";
import Link from "next/link";
import {
  ArrowIcon,
  CameraIcon,
  CheckIcon,
  HeadsetIcon,
  MonitorIcon,
  NetworkIcon,
  ShieldIcon,
  StoreIcon,
  TagIcon,
  WhatsAppIcon,
  WrenchIcon,
} from "@/components/icons";
import { MonitorWall } from "@/components/monitor-wall";
import { ProductCard } from "@/components/product-card";
import { VideoTile } from "@/components/video-tile";
import { categories, imagePath, productVideos } from "@/lib/catalog";
import { getCatalog } from "@/lib/products";
import { mapsUrl, site, whatsappUrl } from "@/lib/site";

const promises = [
  { icon: ShieldIcon, title: "Genuine products", text: "Boxed stock from the brands we list" },
  { icon: HeadsetIcon, title: "Reliable support", text: "Call or WhatsApp the people who sold it" },
  { icon: TagIcon, title: "Best price", text: "Ask us for bulk and full-kit rates" },
  { icon: StoreIcon, title: "A real shop in Rewa", text: "Near Janta College Gate, Anantpur" },
];

const services = [
  {
    icon: CameraIcon,
    title: "CCTV installation",
    text: "Camera placement, wiring, recorder setup and mobile viewing for homes, shops and offices.",
  },
  {
    icon: WrenchIcon,
    title: "Repair and service",
    text: "No picture, blurry night view, failed power supply or a recorder that stopped saving.",
  },
  {
    icon: NetworkIcon,
    title: "PoE and networking",
    text: "Switches, cabling and IP camera setup so everything talks to your recorder.",
  },
  {
    icon: MonitorIcon,
    title: "Computer and IT support",
    text: "Accessories, printers, toner and help getting your office systems running.",
  },
];

const compare = [
  {
    title: "Bullet camera",
    image: "eyesera-5mp-bullet",
    bestFor: "Gates, parking, outer walls",
    points: ["Long, narrow body that clearly shows it is recording", "Weatherproof models for outdoors"],
    href: "/shop?category=cameras&type=Bullet",
  },
  {
    title: "Dome camera",
    image: "eyesera-5mp-dome-photo",
    bestFor: "Rooms, counters, corridors",
    points: ["Discreet ceiling fit that blends in", "Harder to tell where it is pointing"],
    href: "/shop?category=cameras&type=Dome",
  },
];

const faqs = [
  {
    q: "IP camera or HD camera, which should I choose?",
    a: "HD cameras are the budget-friendly choice and suit many homes and small shops. IP cameras give a sharper picture and use one network cable for power and video, which keeps wiring cleaner on new installs. Tell us your site and we will suggest the right one.",
  },
  {
    q: "How many cameras do I need?",
    a: "Count every entry point first, then add cash counters, parking and any long corridor. Most homes start with 2 to 4 cameras and most shops with 4 to 8. The Kit Builder gives you a parts list for any count.",
  },
  {
    q: "Do you only sell cameras, or install them too?",
    a: "Both. You can buy products for your own fitter, or ask us to handle the installation. Choose installation at checkout, or message us with your location.",
  },
  {
    q: "How does ordering work?",
    a: "Add products to the cart and send your order on WhatsApp. We confirm stock, final price and delivery or pickup with you there. You pay only after that confirmation.",
  },
];

export default async function Home() {
  const products = await getCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const videoSlugs = new Set(products.map((product) => product.slug));

  return (
    <>
      {/* Hero */}
      <section className="on-ink grid-texture bg-ink text-white">
        <div className="wrap grid items-center gap-10 py-12 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <p className="eyebrow flex items-center gap-2 text-signal">
              <span className="rec-dot" /> {site.lines.join(" / ")}
            </p>
            <h1 className="display mt-5 text-[2.5rem] sm:text-6xl xl:text-[4.4rem]">
              CCTV for Rewa’s homes, shops and offices.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Buy Eyesera and Dynexa cameras, power supplies and PoE switches
              from a local shop that can also install them and pick up the
              phone later.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop?category=cameras" className="btn btn-signal">
                Shop cameras <ArrowIcon size={18} />
              </Link>
              <Link href="/kit-builder" className="btn btn-ghost text-white">
                Build your CCTV kit
              </Link>
            </div>
          </div>
          <MonitorWall />
        </div>
      </section>

      {/* Promises */}
      <section aria-label="Why buy from us" className="border-b border-line bg-white">
        <ul className="wrap grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon size={24} className="mt-0.5 shrink-0 text-ink-3" />
              <div>
                <p className="font-bold leading-tight">{title}</p>
                <p className="mt-1 text-sm leading-snug text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="wrap py-14 lg:py-20">
        <h2 className="display text-3xl sm:text-4xl">Shop by category</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category, index) => (
            <li key={category.id} className={index === 0 ? "col-span-2 lg:col-span-1" : ""}>
              <Link
                href={`/shop?category=${category.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink"
              >
                <span className="relative block aspect-[4/3] bg-white">
                  <Image
                    src={imagePath(category.image)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="flex flex-1 flex-col border-t border-line p-3.5">
                  <span className="font-bold leading-tight">{category.label}</span>
                  <span className="mt-1 text-sm text-muted">{category.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Kit builder pitch */}
      <section className="wrap">
        <div className="on-ink grid overflow-hidden rounded-2xl bg-signal text-ink lg:grid-cols-[1.1fr_1fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="eyebrow">Kit Builder</p>
            <h2 className="display mt-3 text-3xl sm:text-[2.6rem]">
              Tell us the camera count. Get the full parts list.
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed">
              Cameras are only half the job. Pick indoor and outdoor numbers and
              we match the right power supply or PoE switch, plus the small
              parts people forget.
            </p>
            <Link href="/kit-builder" className="btn btn-ink mt-6">
              Start the Kit Builder <ArrowIcon size={18} />
            </Link>
          </div>
          <div className="relative min-h-60 bg-white">
            <Image
              src={imagePath("eyesera-5mp-dome-box")}
              alt="Eyesera 5MP IP dome camera with its box, cable and mounting kit"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain p-4"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="wrap py-14 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-3xl sm:text-4xl">Popular picks</h2>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold underline decoration-signal decoration-[3px] underline-offset-4"
          >
            View all <ArrowIcon size={16} />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      {/* Bullet vs dome */}
      <section className="border-y border-line bg-white py-14 lg:py-20">
        <div className="wrap">
          <h2 className="display max-w-2xl text-3xl sm:text-4xl">Bullet or dome? A quick guide</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {compare.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group grid grid-cols-[38%_1fr] overflow-hidden rounded-xl border border-line transition-colors hover:border-ink"
              >
                <span className="relative block min-h-52 bg-white">
                  <Image
                    src={imagePath(item.image)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 18vw, 38vw"
                    className="object-contain p-2"
                  />
                </span>
                <span className="flex flex-col border-l border-line p-5">
                  <span className="display text-xl">{item.title}</span>
                  <span className="eyebrow mt-2 text-muted">Best for: {item.bestFor}</span>
                  <span className="mt-3 space-y-1.5">
                    {item.points.map((point) => (
                      <span key={point} className="flex gap-2 text-[0.95rem] leading-snug">
                        <CheckIcon size={18} className="mt-0.5 shrink-0 text-wa" />
                        {point}
                      </span>
                    ))}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-semibold">
                    See {item.title.toLowerCase()}s
                    <ArrowIcon size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="on-ink grid-texture bg-ink text-white">
        <div className="wrap py-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="eyebrow text-signal">Sales and service</p>
              <h2 className="display mt-3 text-3xl sm:text-4xl">
                We fit it, fix it and answer when you call
              </h2>
            </div>
            <Link href="/services" className="btn btn-ghost text-white">
              All services
            </Link>
          </div>
          <ul className="mt-9 grid gap-px overflow-hidden rounded-xl bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, text }) => (
              <li key={title} className="bg-ink p-6">
                <Icon size={26} className="text-signal" />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-white/75">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Videos */}
      <section className="py-14 lg:py-20">
        <div className="wrap">
          <h2 className="display text-3xl sm:text-4xl">Watch before you buy</h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Short product videos, so you can see what comes in the box.
          </p>
        </div>
        <ul className="scroll-row wrap mt-8 flex gap-4 overflow-x-auto pb-4">
          {productVideos.filter((video) => videoSlugs.has(video.slug)).map((video) => (
            <li key={video.file} className="w-[14.5rem] shrink-0 lg:w-[12.5rem]">
              <VideoTile
                file={video.file}
                title={video.title}
                className="aspect-[9/16] rounded-xl"
              />
              <Link
                href={`/products/${video.slug}`}
                className="mt-2.5 block font-semibold leading-snug hover:underline"
              >
                {video.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ and shop */}
      <section className="border-t border-line bg-white py-14 lg:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Common questions</h2>
            <div className="mt-6 border-t border-line">
              {faqs.map((faq) => (
                <details key={faq.q} className="faq border-b border-line">
                  <summary className="flex min-h-16 items-center justify-between gap-4 py-3 text-lg font-semibold">
                    {faq.q}
                    <span className="faq-sign text-2xl font-normal transition-transform">+</span>
                  </summary>
                  <p className="pb-5 leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="on-ink h-fit rounded-2xl bg-ink p-7 text-white">
            <p className="eyebrow text-signal">Visit the shop</p>
            <p className="display mt-3 text-2xl">{site.fullName}</p>
            <address className="mt-3 not-italic leading-relaxed text-white/80">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.line3}
            </address>
            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href={whatsappUrl("Hello Krishna Enterprises, I need help with CCTV.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa"
              >
                <WhatsAppIcon /> Ask on WhatsApp
              </a>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-ghost text-white">
                Get directions
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
