import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-12">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-7">
        <p className="eyebrow text-muted">Shop admin</p>
        <h1 className="display mt-2 mb-6 text-3xl">Sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
