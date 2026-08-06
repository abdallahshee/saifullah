"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { PasswordInput } from "@mantine/core";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordRequest,
} from "@/lib/db/types/auth.types";

type SubmitResult = { status: "idle" } | { status: "error"; message: string };

export function ResetPasswordForm() {
  const router = useRouter();
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<ResetPasswordRequest>({
    initialValues: { password: "", confirmPassword: "" },
    validate: schemaResolver(resetPasswordSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });

    const supabase = createClient();
    // Requires an active recovery session, established by the link the
    // user followed from their email (see note below on the callback route).
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setResult({ status: "error", message: error.message });
      return;
    }

    router.push("/login");
  });

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <PasswordInput
        label="New password"
        placeholder="••••••••"
        withAsterisk
        {...form.getInputProps("password")}
      />

      <PasswordInput
        label="Confirm new password"
        placeholder="••••••••"
        withAsterisk
        {...form.getInputProps("confirmPassword")}
      />

      <button
        type="submit"
        disabled={form.submitting}
        className="btn mt-2 border-none bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-2)]"
      >
        {form.submitting && <span className="loading loading-spinner loading-sm" />}
        {form.submitting ? "Updating..." : "Update password"}
      </button>

      {result.status === "error" && (
        <div role="alert" className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{result.message}</span>
        </div>
      )}
    </form>
  );
}