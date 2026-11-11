"use client";

import { removeProduct } from "@/app/admin/product-actions";

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={removeProduct}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${name}" for good? Old orders keep their copy of it. To take it off the store for now, untick "Show in store" instead.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn-ghost text-rec">
        Delete product
      </button>
    </form>
  );
}
