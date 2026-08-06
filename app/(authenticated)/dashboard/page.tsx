import React from 'react'

const page = () => {
  return (
     <section className="border-t border-[var(--line)] px-8 py-12 sm:px-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          <RoleItem
            color="var(--role-admin)"
            label="Admins"
            desc="Oversee staff and school-wide records"
          />
          <RoleItem
            color="var(--role-secretary)"
            label="Secretaries"
            desc="Handle admissions and day-to-day updates"
          />
          <RoleItem
            color="var(--role-teacher)"
            label="Teachers"
            desc="Mark attendance for their own classes"
          />
          <RoleItem
            color="var(--role-parent)"
            label="Parents"
            desc="Follow their child's attendance"
          />
        </div>
      </section>
  )
}

export default page


function RoleItem({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="text-left">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--slate)]">
        {desc}
      </p>
    </div>
  );
}