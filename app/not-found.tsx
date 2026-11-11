import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[60vh] place-content-center py-16 text-center">
      <p className="eyebrow text-muted">No signal</p>
      <h1 className="display mt-3 text-4xl">We could not find that page</h1>
      <Link href="/shop" className="btn btn-ink mx-auto mt-6">
        Go to the shop
      </Link>
    </div>
  );
}
