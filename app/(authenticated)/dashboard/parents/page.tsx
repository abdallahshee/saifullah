import { getParents } from "@/server/parent.server";
import Link from "next/link";
import { ParentsList } from "./parent-list";


export default async function ParentsPage() {
  const parentList = await getParents();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            PARENTS
          </p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">
            All parents
          </h1>
        </div>

        <Link href="/parents/new" className="btn btn-primary">
          + Add parent
        </Link>
      </div>

      <ParentsList parents={parentList} />
    </div>
  );
}