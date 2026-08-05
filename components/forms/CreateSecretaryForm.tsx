"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { TextInput } from "@mantine/core";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ProfileRequest, profileSchema } from "@/lib/db/types/profiles.types";
import { createSecretary } from "@/server/secretary.server";

type SubmitResult =
  | { status: "idle" }
  | { status: "success"; email: string; temporaryPassword: string | null }
  | { status: "error"; message: string };

export function CreateSecretaryForm() {
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<ProfileRequest>({
    initialValues: { firstName: "", lastName: "", email: "", phone: "" },
    validate: schemaResolver(profileSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });
    try {
      const { temporaryPassword } = await createSecretary(values);
      setResult({
        status: "success",
        email: values.email, // guaranteed string - already validated by the form
        temporaryPassword: temporaryPassword ?? null,
      });
      form.reset();
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Couldn't create secretary",
      });
    }
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 sm:max-w-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <TextInput
          label="First name"
          placeholder="Jane"
          withAsterisk
          className="flex-1"
          {...form.getInputProps("firstName")}
        />

        <TextInput
          label="Last name"
          placeholder="Doe"
          withAsterisk
          className="flex-1"
          {...form.getInputProps("lastName")}
        />
      </div>

      <TextInput
        label="Email"
        placeholder="jane@school.com"
        type="email"
        withAsterisk
        {...form.getInputProps("email")}
      />

      <TextInput
        label="Phone"
        placeholder="Optional"
        {...form.getInputProps("phone")}
      />

      {/* daisyUI button - loading state via btn-disabled + a spinner span,
          since daisyUI has no built-in `loading` prop like Mantine's Button */}
      <button
        type="submit"
        disabled={form.submitting}
        className="btn btn-primary"
      >
        {form.submitting && (
          <span className="loading loading-spinner loading-sm" />
        )}
        {form.submitting ? "Adding..." : "Add secretary"}
      </button>

      {/* daisyUI alert - success variant */}
      {result.status === "success" && (
        <div role="alert" className="alert alert-success">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Secretary created</h3>
            <div className="text-sm">
              Account created for {result.email}.
              {result.temporaryPassword && (
                <>
                  {" "}
                  Temporary password: <code>{result.temporaryPassword}</code>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* daisyUI alert - error variant */}
      {result.status === "error" && (
        <div role="alert" className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Couldn't create secretary</h3>
            <div className="text-sm">{result.message}</div>
          </div>
        </div>
      )}
    </form>
  );
}