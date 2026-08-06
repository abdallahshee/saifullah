import Link from "next/link";
import { getClasses } from "@/server/classes.server";
import { ClassesList } from "./classes-list";


export default async function ClassesPage() {
  const classList = await getClasses();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            CLASSES
          </p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">
            All classes
          </h1>
        </div>

        <Link href="/classes/new" className="btn btn-primary">
          + Create class
        </Link>
      </div>

      <ClassesList classes={classList} />
    </div>
  );
}
