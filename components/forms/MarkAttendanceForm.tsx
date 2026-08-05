"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { SegmentedControl, TextInput } from "@mantine/core";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  getClassAttendanceRoster,
  submitClassAttendance,
  type ClassRosterEntry,
} from "@/server/attendance.server";


type FormEntry = Omit<ClassRosterEntry, "status"> & {
  status: "present" | "absent";
};

type FormValues = {
  date: string;
  entries: FormEntry[];
};

type LoadState =
  | { status: "loading" }
  | { status: "editable" }
  | { status: "locked"; entries: ClassRosterEntry[] }
  | { status: "error"; message: string };

type SubmitResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MarkAttendanceForm({ classId }: { classId: string }) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<FormValues>({
    initialValues: { date: today(), entries: [] },
  });

  const date = form.values.date;

  const loadRoster = useCallback(
    async (forDate: string) => {
      setLoadState({ status: "loading" });
      setResult({ status: "idle" });
      try {
        const roster = await getClassAttendanceRoster(classId, forDate);
        const alreadySubmitted = roster.some((r) => r.status !== null);
        if (alreadySubmitted) {
          setLoadState({ status: "locked", entries: roster });
          return;
        }
        form.setFieldValue(
          "entries",
          roster.map((r) => ({
            studentId: r.studentId,
            firstName: r.firstName,
            lastName: r.lastName,
            status: "present" as const,
          })),
        );
        setLoadState({ status: "editable" });
      } catch (err) {
        setLoadState({
          status: "error",
          message: err instanceof Error ? err.message : "Couldn't load class roster",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classId],
  );

  useEffect(() => {
    // Fetching the roster whenever classId/date change is the documented
    // effect use case (https://react.dev/learn/you-might-not-need-an-effect#fetching-data);
    // there's no data-fetching library in this project to route it through instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoster(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date]);

  const markAllPresent = () => {
    form.setFieldValue(
      "entries",
      form.values.entries.map((e) => ({ ...e, status: "present" as const })),
    );
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setResult({ status: "idle" });
    try {
      await submitClassAttendance({
        classId,
        date: values.date,
        records: values.entries.map((e) => ({
          studentId: e.studentId,
          status: e.status,
        })),
      });
      setResult({ status: "success" });
      loadRoster(values.date);
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Couldn't submit attendance",
      });
    }
  });

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <TextInput
        label="Date"
        type="date"
        max={today()}
        withAsterisk
        className="max-w-xs"
        {...form.getInputProps("date")}
      />

      {loadState.status === "loading" && (
        <div className="flex items-center gap-2 text-sm opacity-70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading roster...
        </div>
      )}

      {loadState.status === "error" && (
        <div role="alert" className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <div className="text-sm">{loadState.message}</div>
        </div>
      )}

      {loadState.status === "locked" && (
        <>
          <div role="alert" className="alert alert-info">
            <CheckCircle2 className="h-5 w-5" />
            <div className="text-sm">
              Attendance for this class was already submitted on {date}.
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadState.entries.map((entry) => (
                  <tr key={entry.studentId}>
                    <td>
                      {entry.firstName} {entry.lastName}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          entry.status === "present" ? "badge-success" : "badge-error"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {loadState.status === "editable" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {form.values.entries.length === 0 ? (
            <div className="text-sm opacity-70">No students in this class yet.</div>
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="btn btn-sm btn-ghost"
                >
                  Mark all present
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.values.entries.map((entry, index) => (
                      <tr key={entry.studentId}>
                        <td className="whitespace-nowrap">
                          {entry.firstName} {entry.lastName}
                        </td>
                        <td>
                          <SegmentedControl
                            data={[
                              { label: "Present", value: "present" },
                              { label: "Absent", value: "absent" },
                            ]}
                            {...form.getInputProps(`entries.${index}.status`)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="submit"
                disabled={form.submitting}
                className="btn btn-primary self-start"
              >
                {form.submitting && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {form.submitting ? "Submitting..." : "Submit attendance"}
              </button>
            </>
          )}

          {result.status === "success" && (
            <div role="alert" className="alert alert-success">
              <CheckCircle2 className="h-5 w-5" />
              <div className="text-sm">Attendance submitted successfully.</div>
            </div>
          )}

          {result.status === "error" && (
            <div role="alert" className="alert alert-error">
              <AlertCircle className="h-5 w-5" />
              <div className="text-sm">{result.message}</div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
