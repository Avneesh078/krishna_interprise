import type { Metadata } from "next";
import { KitBuilder } from "@/components/kit-builder";

export const metadata: Metadata = {
  title: "CCTV Kit Builder",
  description:
    "Choose your indoor and outdoor camera count and get a matched CCTV parts list with cameras, power and accessories.",
};

export default function KitBuilderPage() {
  return (
    <div className="wrap py-9 lg:py-12">
      <p className="eyebrow text-muted">Kit Builder</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">Build your CCTV kit</h1>
      <p className="mb-8 mt-3 max-w-2xl text-lg text-muted">
        Set your camera count and we will match the power supply or PoE switch,
        plus the small parts that are easy to forget.
      </p>
      <KitBuilder />
    </div>
  );
}
