import Link from "next/link";
import { getStaff } from "@/server/staff.server";
import { StaffList } from "./staff-list";

export default async function StaffPage() {
  const staffList = await getStaff();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            STAFF
          </p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">
            All staff
          </h1>
        </div>

        <Link href="/staff/new" className="btn btn-primary">
          + Add staff
        </Link>
      </div>

      <StaffList staff={staffList} />
    </div>
  );
}