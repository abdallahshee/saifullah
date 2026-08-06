"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { TextInput, Textarea } from "@mantine/core";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/server/events.server";
import { EventRequest, eventSchema } from "@/lib/db/types/events.types";


type SubmitResult = { status: "idle" } | { status: "error"; message: string };

export function CreateEventForm() {
  const router = useRouter();
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<EventRequest>({
    initialValues: {
      title: "",
      description: "",
      eventDate: "",
      venue: "",
      imageUrls: [""],
    },
    validate: schemaResolver(eventSchema, { sync: true }),
  });

  const descriptionLength = form.values.description.length;
  const titleLength = form.values.title.length;

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });

    try {
      // Drop empty URL fields before submitting — the form always keeps
      // at least one input visible for convenience, even if unfilled.
      const payload: EventRequest = {
        ...values,
        imageUrls: values.imageUrls.filter((url) => url.trim() !== ""),
        // datetime-local input gives "2026-03-14T09:00" with no timezone —
        // convert to a full ISO string matching the eventDate column.
      };

      await createEvent(payload);
      router.push("/dashboard/events");
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Couldn't create event",
      });
    }
  });

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <div>
        <TextInput
          label="Title"
          placeholder="Annual Sports Day"
          withAsterisk
          {...form.getInputProps("title")}
        />
        <p className="mt-1 text-xs text-[var(--slate)]">
          {titleLength}/25 characters (min 10)
        </p>
      </div>

      <div>
        <Textarea
          label="Description"
          placeholder="Describe what happened, who was involved, and what made the day memorable..."
          withAsterisk
          minRows={6}
          {...form.getInputProps("description")}
        />
        <p
          className={`mt-1 text-xs ${
            descriptionLength < 400 || descriptionLength > 800
              ? "text-red-600"
              : "text-[var(--slate)]"
          }`}
        >
          {descriptionLength}/800 characters (min 400)
        </p>
      </div>

      <TextInput
        label="Venue"
        placeholder="School Field"
        withAsterisk
        {...form.getInputProps("venue")}
      />

      <TextInput
        label="Date & time"
        type="datetime-local"
        withAsterisk
        {...form.getInputProps("eventDate")}
      />

      <div>
        <label className="text-sm font-medium text-[var(--ink)]">
          Image URLs
        </label>
        <p className="mt-1 text-xs text-[var(--slate)]">
          Paste links to already-uploaded photos (upload flow not wired up
          yet — see note below).
        </p>

        <div className="mt-2 flex flex-col gap-2">
          {form.values.imageUrls.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <TextInput
                placeholder="https://..."
                className="flex-1"
                {...form.getInputProps(`imageUrls.${index}`)}
              />
              {form.values.imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => form.removeListItem("imageUrls", index)}
                  aria-label="Remove image URL"
                  className="btn btn-ghost btn-sm text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => form.insertListItem("imageUrls", "")}
          className="btn btn-ghost btn-sm mt-2 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add another image
        </button>
      </div>

      <button
        type="submit"
        disabled={form.submitting}
        className="btn btn-primary mt-2"
      >
        {form.submitting && <span className="loading loading-spinner loading-sm" />}
        {form.submitting ? "Creating..." : "Create event"}
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