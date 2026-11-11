"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block font-semibold">Password</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-invalid={Boolean(state?.error)}
          aria-describedby={state?.error ? "login-error" : undefined}
          className="field"
        />
      </label>
      {state?.error && (
        <p id="login-error" role="alert" className="text-sm font-medium text-rec">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-ink w-full">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
