"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { TextInput } from "@mantine/core";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { StudentRequest, studentSchema } from "@/lib/db/types/students.types";
import { createStudent } from "@/server/student.server";

type SubmitResult =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

// The form collects dateOfBirth as a plain string (from a native date
// input), but StudentRequest expects a real Date object - so the form's
// local value type differs slightly from StudentRequest until submit time,
// where we convert it.
type StudentFormValues = Omit<StudentRequest, "dateOfBirth"> & {
  dateOfBirth: string;
};

export function CreateStudentForm() {
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<StudentFormValues>({
    initialValues: { firstName: "", lastName: "", dateOfBirth: "", classId: "" },
      validate: schemaResolver(studentSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });
    try {
      const payload: StudentRequest = {
        ...values,
      };

      const student = await createStudent(payload);
      setResult({
        status: "success",
        message: `${student.firstName} ${student.lastName} was added successfully.`,
      });
      form.reset();
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Couldn't create student",
      });
    }
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-6xl flex-col gap-4"
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
        label="Date of birth"
        type="date"
        withAsterisk
        {...form.getInputProps("dateOfBirth")}
      />

      <TextInput
        label="Class"
        placeholder="Class ID"
        withAsterisk
        {...form.getInputProps("classId")}
      />

      <button
        type="submit"
        disabled={form.submitting}
        className="btn btn-primary"
      >
        {form.submitting && (
          <span className="loading loading-spinner loading-sm" />
        )}
        {form.submitting ? "Adding..." : "Add student"}
      </button>

      {result.status === "success" && (
        <div role="alert" className="alert alert-success">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Student created</h3>
            <div className="text-sm">{result.message}</div>
          </div>
        </div>
      )}

      {result.status === "error" && (
        <div role="alert" className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Couldn't create student</h3>
            <div className="text-sm">{result.message}</div>
          </div>
        </div>
      )}
    </form>
  );
}