import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="wrap py-9 lg:py-12">
      <h1 className="display mb-7 text-4xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
