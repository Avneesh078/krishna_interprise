import type { ReactNode } from "react";

/** Shared pieces for admin pages. */

export function AdminPage({
  title,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow text-muted">{eyebrow}</p>}
          <h1 className="display mt-1 text-3xl sm:text-4xl">{title}</h1>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function DatabaseError() {
  return (
    <div role="alert" className="rounded-xl border border-rec/40 bg-white p-6">
      <p className="font-bold">Could not connect to the database.</p>
      <p className="mt-1 text-muted">
        Check DATABASE_URL in .env.local and that MySQL is running, then run{" "}
        <code className="font-mono">npm run db:setup</code>.
      </p>
    </div>
  );
}

export function Loading({ label }: { label: string }) {
  return <p className="text-muted">{label}</p>;
}
