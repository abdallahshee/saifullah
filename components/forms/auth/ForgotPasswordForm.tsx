"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { TextInput } from "@mantine/core";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordRequest,
} from "@/lib/db/types/auth.types";

type SubmitResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export function ForgotPasswordForm() {
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<ForgotPasswordRequest>({
    initialValues: { email: "" },
    validate: schemaResolver(forgotPasswordSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      // Must match a URL allowed in your Supabase project's Redirect URLs.
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setResult({ status: "error", message: error.message });
      return;
    }

    setResult({ status: "success" });
  });

  // Once the reset email is sent, replace the form with a confirmation
  // message rather than leaving a stale form on screen.
  if (result.status === "success") {
    return (
      <div role="alert" className="alert alert-success mt-8">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm">
          If an account exists for {form.values.email}, a reset link is on its way.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      {result.status === "error" && (
        <div role="alert" className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      <TextInput
        label="Email"
        placeholder="you@school.com"
        type="email"
        withAsterisk
        {...form.getInputProps("email")}
      />

      <button
        type="submit"
        disabled={form.submitting}
        className="btn mt-2 border-none bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-2)]"
      >
        {form.submitting && <span className="loading loading-spinner loading-sm" />}
        {form.submitting ? "Sending..." : "Send reset link"}
      </button>

      <Link
        href="/login"
        className="mt-2 text-center text-xs text-[var(--slate)] underline underline-offset-2 hover:text-[var(--ink)]"
      >
        Back to sign in
      </Link>
    </form>
  );
}