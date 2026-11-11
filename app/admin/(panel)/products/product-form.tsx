"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { categories, type Product } from "@/lib/catalog";
import { saveProduct } from "@/app/admin/product-actions";

type FormProduct = Product & { listed: boolean; sortOrder: number };

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-line bg-white p-5">
      <legend className="eyebrow px-1 text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 shrink-0 accent-ink"
      />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
    </label>
  );
}

function NewPhotoPicker() {
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  return (
    <div>
      <label htmlFor="newImages" className="mb-1.5 block font-semibold">
        Add photos
      </label>
      <input
        id="newImages"
        name="newImages"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) =>
          setPreviews(Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file)))
        }
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-4 file:py-2.5 file:font-semibold file:text-white"
      />
      <p className="mt-1 text-sm text-muted">JPG, PNG or WebP, up to 8 MB each and 8 at a time.</p>
      {previews.length > 0 && (
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {previews.map((url) => (
            <li key={url} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
              <Image src={url} alt="" fill unoptimized className="object-contain" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type FormProps = { product?: FormProduct; brands: string[] };

/**
 * Next.js keeps visited pages alive, so without this a second "Add product" would open with the
 * previous product's details. The key gives a clean form on each fresh visit but keeps typing
 * across browser back and forward.
 */
export function ProductForm(props: FormProps) {
  const { bfcacheId } = useRouter();
  return <ProductFormFields key={bfcacheId} {...props} />;
}

function ProductFormFields({ product, brands }: FormProps) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const values = state?.values;
  const value = (key: string, fallback: string) => values?.[key] ?? fallback;
  const checked = (key: string, fallback: boolean) => (values ? values[key] === "on" : fallback);

  return (
    <form key={state?.nonce ?? "initial"} action={action} className="pb-24">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Section title="Basics">
            <Field label="Product name" htmlFor="name">
              <input
                id="name"
                name="name"
                required
                maxLength={200}
                defaultValue={value("name", product?.name ?? "")}
                className="field"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand" htmlFor="brand">
                <input
                  id="brand"
                  name="brand"
                  required
                  maxLength={80}
                  list="brand-options"
                  defaultValue={value("brand", product?.brand ?? "")}
                  className="field"
                />
                <datalist id="brand-options">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </Field>
              <Field label="Category" htmlFor="category">
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={value("category", product?.category ?? "")}
                  className="field"
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field
              label="Web address"
              htmlFor="slug"
              hint={
                product
                  ? "Changing this changes the product's link, so old shared links stop working."
                  : "Leave empty to make one from the name."
              }
            >
              <div className="flex items-center rounded-lg border-[1.5px] border-line bg-paper pl-3 focus-within:border-ink">
                <span className="shrink-0 font-mono text-sm text-muted">/products/</span>
                <input
                  id="slug"
                  name="slug"
                  maxLength={120}
                  defaultValue={value("slug", product?.slug ?? "")}
                  placeholder="made-from-the-name"
                  className="h-12 w-full min-w-0 bg-white px-2 font-mono text-sm outline-none"
                />
              </div>
            </Field>
          </Section>

          <Section title="Price">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Selling price (₹)" htmlFor="price">
                <input
                  id="price"
                  name="price"
                  required
                  inputMode="numeric"
                  pattern="[0-9,₹ ]+"
                  defaultValue={value("price", product ? String(product.price) : "")}
                  className="field font-mono"
                />
              </Field>
              <Field label="MRP (₹), optional" htmlFor="mrp" hint="Shown struck through with the % off.">
                <input
                  id="mrp"
                  name="mrp"
                  inputMode="numeric"
                  pattern="[0-9,₹ ]*"
                  defaultValue={value("mrp", product?.mrp ? String(product.mrp) : "")}
                  className="field font-mono"
                />
              </Field>
            </div>
          </Section>

          <Section title="Description">
            <Field label="Short description" htmlFor="summary" hint="One or two sentences under the product name.">
              <textarea
                id="summary"
                name="summary"
                rows={3}
                maxLength={500}
                defaultValue={value("summary", product?.summary ?? "")}
                className="field"
              />
            </Field>
            <Field label="Key features" htmlFor="highlights" hint="One feature per line. Shown as a tick list.">
              <textarea
                id="highlights"
                name="highlights"
                rows={5}
                defaultValue={value("highlights", product?.highlights.join("\n") ?? "")}
                placeholder={"5MP Ultra HD picture\nNight vision up to 30 m"}
                className="field"
              />
            </Field>
            <Field
              label="Specifications"
              htmlFor="specs"
              hint='One per line as "Label: Value". Shown as a table.'
            >
              <textarea
                id="specs"
                name="specs"
                rows={6}
                defaultValue={value(
                  "specs",
                  product?.specs.map(([label, text]) => `${label}: ${text}`).join("\n") ?? "",
                )}
                placeholder={"Resolution: 5MP\nWeatherproofing: IP67"}
                className="field font-mono text-sm"
              />
            </Field>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Status">
            <Toggle
              name="listed"
              label="Show in store"
              hint="Untick to hide it without deleting."
              defaultChecked={checked("listed", product?.listed ?? true)}
            />
            <Toggle
              name="inStock"
              label="In stock"
              hint="Out of stock products stay visible but cannot be ordered."
              defaultChecked={checked("inStock", product?.inStock ?? true)}
            />
            <Toggle
              name="featured"
              label="Popular pick"
              hint="Shown on the home page."
              defaultChecked={checked("featured", product?.featured ?? false)}
            />
          </Section>

          <Section title="Photos">
            {product && product.images.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-muted">
                  Choose the main photo. Tick Remove to delete a photo when you save.
                </p>
                <ul className="grid grid-cols-3 gap-2">
                  {product.images.map((url, index) => (
                    <li key={url} className="rounded-lg border border-line bg-white p-1.5">
                      <span className="relative block aspect-square">
                        <Image src={url} alt={`Photo ${index + 1}`} fill sizes="120px" className="object-contain" />
                      </span>
                      <label className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                        <input type="radio" name="mainImage" value={url} defaultChecked={index === 0} className="accent-ink" />
                        Main
                      </label>
                      <label className="mt-1 flex items-center gap-1.5 text-xs font-medium text-rec">
                        <input type="checkbox" name="removeImage" value={url} className="accent-rec" />
                        Remove
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <NewPhotoPicker />
          </Section>

          <Section title="Camera options">
            <p className="text-sm text-muted">Used by the shop filters. Leave empty for non-camera products.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type" htmlFor="cameraType">
                <select id="cameraType" name="cameraType" defaultValue={value("cameraType", product?.cameraType ?? "")} className="field">
                  <option value="">None</option>
                  <option value="Bullet">Bullet</option>
                  <option value="Dome">Dome</option>
                </select>
              </Field>
              <Field label="Signal" htmlFor="connection">
                <select id="connection" name="connection" defaultValue={value("connection", product?.connection ?? "")} className="field">
                  <option value="">None</option>
                  <option value="HD">HD</option>
                  <option value="IP">IP</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Display order">
            <Field label="Position" htmlFor="sortOrder" hint="Lower numbers show first. Leave empty to add at the end.">
              <input
                id="sortOrder"
                name="sortOrder"
                inputMode="numeric"
                defaultValue={value("sortOrder", product ? String(product.sortOrder) : "")}
                className="field font-mono"
              />
            </Field>
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button type="submit" disabled={pending} className="btn btn-signal">
            {pending ? "Saving…" : product ? "Save changes" : "Add product"}
          </button>
          <Link href="/admin/products" className="btn btn-ghost">
            Cancel
          </Link>
          <p aria-live="polite" className="min-w-0 flex-1 text-sm font-medium">
            {state?.error && <span className="text-rec">{state.error}</span>}
            {state?.saved && <span className="text-wa">{state.saved}</span>}
          </p>
        </div>
      </div>
    </form>
  );
}
