"use client";

import { useActionState } from "react";
import {
  admitSecretaryAction,
  type AdmitSecretaryState,
} from "@/lib/actions/admit-secretary";

const initialState: AdmitSecretaryState = { status: "idle" };

export function AdmitSecretaryForm() {
  const [state, formAction, pending] = useActionState(
    admitSecretaryAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="rounded border border-black/[.145] px-3 py-2 dark:border-white/[.145]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded border border-black/[.145] px-3 py-2 dark:border-white/[.145]"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Adding..." : "Add secretary"}
      </button>

      {state.status === "success" && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          Secretary account created for {state.email}.
          {state.temporaryPassword && (
            <>
              {" "}
              Temporary password: <code>{state.temporaryPassword}</code>
            </>
          )}
        </p>
      )}

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
