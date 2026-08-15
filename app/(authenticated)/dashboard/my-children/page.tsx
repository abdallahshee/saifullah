import { getMyChildren } from "@/server/student.server";
import { MyChildrenList } from "./children-list";

export default async function MyChildrenPage() {
  const children = await getMyChildren();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
        MY CHILDREN
      </p>
      <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">
        My children
      </h1>

      <MyChildrenList children={children} />
    </div>
  );
}