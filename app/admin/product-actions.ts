"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import { CATEGORY_IDS, type CategoryId, type Product } from "@/lib/catalog";
import { slugify } from "@/lib/slug";
import {
  deleteUploads,
  MAX_UPLOADS_PER_SAVE,
  saveProductPhoto,
  UploadError,
} from "@/lib/media";
import {
  deleteProduct,
  getAdminProduct,
  insertProduct,
  nextSortOrder,
  PRODUCTS_TAG,
  quickUpdateProduct,
  slugTaken,
  updateProduct,
  type ProductInput,
  type QuickField,
} from "@/lib/products";

export type ProductFormState = {
  error?: string;
  saved?: string;
  /** What was submitted, so the form keeps the admin's typing after a validation error. */
  values?: Record<string, string>;
  /** Changes on every response so the form remounts with the latest values. */
  nonce: number;
} | null;

const MAX_PRICE = 10_000_000;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function parseRupees(raw: string, label: string, required: boolean) {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!cleaned) {
    if (required) throw new Error(`${label} is required.`);
    return null;
  }
  const value = Number(cleaned);
  if (!Number.isInteger(value) || value < 1 || value > MAX_PRICE) {
    throw new Error(`${label} must be a whole number of rupees, e.g. 1450.`);
  }
  return value;
}

function parseLines(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecs(raw: string): [string, string][] {
  const lines = parseLines(raw);
  if (lines.length > 25) throw new Error("Use at most 25 specification lines.");
  return lines.map((line) => {
    const split = line.indexOf(":");
    const label = split > 0 ? line.slice(0, split).trim() : "";
    const value = split > 0 ? line.slice(split + 1).trim() : "";
    if (!label || !value) {
      throw new Error(`Specification "${line}" needs the form "Label: Value", e.g. "Resolution: 5MP".`);
    }
    return [label.slice(0, 60), value.slice(0, 200)];
  });
}

/** Everything except photos, which are handled after the rest passes. */
async function readProductFields(formData: FormData, id: number | null) {
  const name = text(formData, "name");
  if (name.length < 2 || name.length > 200) throw new Error("Product name must be 2 to 200 characters.");

  const slug = slugify(text(formData, "slug") || name);
  if (!slug) throw new Error("Web address (slug) can use only letters and numbers.");
  if (await slugTaken(slug, id ?? undefined)) {
    throw new Error(`Another product already uses the web address "${slug}". Change the name or the web address.`);
  }

  const brand = text(formData, "brand");
  if (!brand || brand.length > 80) throw new Error("Brand is required (up to 80 characters).");

  const category = text(formData, "category") as CategoryId;
  if (!CATEGORY_IDS.includes(category)) throw new Error("Choose a category.");

  const price = parseRupees(text(formData, "price"), "Selling price", true)!;
  const mrp = parseRupees(text(formData, "mrp"), "MRP", false);
  if (mrp !== null && mrp < price) throw new Error("MRP should be equal to or higher than the selling price.");

  const summary = text(formData, "summary");
  if (summary.length > 500) throw new Error("Short description must be under 500 characters.");

  const highlights = parseLines(text(formData, "highlights")).map((line) => line.slice(0, 200));
  if (highlights.length > 12) throw new Error("Use at most 12 key features.");

  const specs = parseSpecs(text(formData, "specs"));

  const cameraType = text(formData, "cameraType");
  const connection = text(formData, "connection");
  const sortRaw = text(formData, "sortOrder");
  const sortOrder = sortRaw ? Number(sortRaw) : await nextSortOrder();
  if (!Number.isInteger(sortOrder) || Math.abs(sortOrder) > 1_000_000) {
    throw new Error("Display order must be a whole number.");
  }

  return {
    slug,
    name,
    brand,
    category,
    price,
    mrp,
    summary,
    highlights,
    specs,
    cameraType: (["Bullet", "Dome"].includes(cameraType) ? cameraType : null) as Product["cameraType"],
    connection: (["IP", "HD"].includes(connection) ? connection : null) as Product["connection"],
    featured: formData.get("featured") === "on",
    inStock: formData.get("inStock") === "on",
    listed: formData.get("listed") === "on",
    sortOrder,
  };
}

function submittedValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const key of ["name", "slug", "brand", "category", "price", "mrp", "summary", "highlights", "specs", "cameraType", "connection", "sortOrder"]) {
    values[key] = String(formData.get(key) ?? "");
  }
  for (const key of ["featured", "inStock", "listed"]) {
    values[key] = formData.get(key) === "on" ? "on" : "";
  }
  return values;
}

export async function saveProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const nonce = Date.now();
  const idRaw = text(formData, "id");
  const id = idRaw ? Number(idRaw) : null;
  const existing = id ? await getAdminProduct(id) : null;
  if (id && !existing) return { error: "This product no longer exists.", nonce };

  let fields;
  try {
    fields = await readProductFields(formData, id);
  } catch (error) {
    return { error: (error as Error).message, values: submittedValues(formData), nonce };
  }

  // Photos: keep the existing ones not ticked for removal (only ones this product really has),
  // put the chosen main photo first, then add new uploads.
  const current = existing?.images ?? [];
  const removed = new Set(formData.getAll("removeImage").map(String));
  let kept = current.filter((url) => !removed.has(url));
  const main = text(formData, "mainImage");
  if (kept.includes(main)) kept = [main, ...kept.filter((url) => url !== main)];

  const files = formData
    .getAll("newImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_UPLOADS_PER_SAVE) {
    return { error: `Upload at most ${MAX_UPLOADS_PER_SAVE} photos at a time.`, values: submittedValues(formData), nonce };
  }
  if (kept.length + files.length === 0) {
    return { error: "Add at least one photo.", values: submittedValues(formData), nonce };
  }
  if (kept.length + files.length > 15) {
    return { error: "A product can have at most 15 photos.", values: submittedValues(formData), nonce };
  }

  const uploaded: string[] = [];
  try {
    for (const file of files) uploaded.push(await saveProductPhoto(file));
  } catch (error) {
    await deleteUploads(uploaded);
    const message = error instanceof UploadError ? error.message : "Could not save the photos.";
    if (!(error instanceof UploadError)) console.error("Photo upload failed", error);
    return { error: message, values: submittedValues(formData), nonce };
  }

  const input: ProductInput = { ...fields, images: [...kept, ...uploaded] };
  let newId: number | null = null;
  try {
    if (existing) {
      await updateProduct(existing.id, input);
      await deleteUploads(current.filter((url) => removed.has(url)));
    } else {
      newId = await insertProduct(input);
    }
  } catch (error) {
    await deleteUploads(uploaded);
    console.error("Saving product failed", error);
    return { error: "Could not save to the database. Please try again.", values: submittedValues(formData), nonce };
  }

  updateTag(PRODUCTS_TAG);
  if (newId) redirect(`/admin/products/${newId}?created=1`);
  refresh();
  return { saved: `Saved ${fields.name}.`, nonce };
}

export async function removeProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const product = Number.isInteger(id) ? await getAdminProduct(id) : null;
  if (!product) redirect("/admin/products");
  await deleteProduct(product.id);
  await deleteUploads(product.images);
  updateTag(PRODUCTS_TAG);
  redirect(`/admin/products?deleted=${encodeURIComponent(product.name)}`);
}

/** Price edits and on/off switches straight from the product list. */
export async function quickUpdate(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const field = String(formData.get("field")) as QuickField;
  if (!Number.isInteger(id) || id < 1) return;

  if (field === "price") {
    const price = Number(String(formData.get("value") ?? "").replace(/[₹,\s]/g, ""));
    if (!Number.isInteger(price) || price < 1 || price > MAX_PRICE) return;
    const product = await getAdminProduct(id);
    if (!product) return;
    await quickUpdateProduct(id, "price", price);
    // An MRP below the new price would show a wrong discount, so clear it.
    if (product.mrp !== null && product.mrp < price) await quickUpdateProduct(id, "mrp", null);
  } else if (field === "inStock" || field === "listed" || field === "featured") {
    await quickUpdateProduct(id, field, formData.get("value") === "1" ? 1 : 0);
  } else {
    return;
  }

  updateTag(PRODUCTS_TAG);
  refresh();
}
