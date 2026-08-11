"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { TextInput, PasswordInput } from "@mantine/core";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LoginRequest, loginSchema } from "@/lib/db/types/auth.types";


type SubmitResult = { status: "idle" } | { status: "error"; message: string };

export function LoginForm() {
  const router = useRouter();
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<LoginRequest>({
    initialValues: { email: "", password: "8d7a55d3-b57a-4e01-8ee5-3d2d8e856834" },
    validate: schemaResolver(loginSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setResult({ status: "error", message: error.message });
      return;
    }

    router.refresh();
    router.push("/dashboard"); // middleware/root page can redirect by role from here
  });

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

      <div>
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          withAsterisk
          {...form.getInputProps("password")}
        />
        <Link
          href="/auth/forgot-password"
          className="mt-1 inline-block text-xs text-[var(--slate)] underline underline-offset-2 hover:text-[var(--ink)]"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={form.submitting}
        className="btn mt-2 border-none bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-2)]"
      >
        {form.submitting && <span className="loading loading-spinner loading-sm" />}
        {form.submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}