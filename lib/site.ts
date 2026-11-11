export const site = {
  name: "Krishna Enterprises",
  city: "Rewa",
  fullName: "Krishna Enterprises Rewa",
  tagline: "Your Trusted Tech Partner",
  lines: ["CCTV", "Computer", "Accessories", "IT Services"],
  address: {
    line1: "Shop No. 01, Janta College Rd",
    line2: "Near Janta College Gate, Anantpur",
    line3: "Arun Nagar, Rewa, Madhya Pradesh 486001",
  },
  phones: [
    { label: "074006 60023", tel: "+917400660023" },
    { label: "88171 23606", tel: "+918817123606" },
  ],
  /** Number that receives WhatsApp orders, with country code and no "+". */
  whatsapp: "918817123606",
};

// Address only: searching the shop name returns several similarly named businesses.
export const mapsQuery = encodeURIComponent(
  `${site.address.line1}, Anantpur, ${site.address.line3}`,
);
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

export function whatsappUrl(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}
