import { requireRole } from "@/lib/auth/current-profile";
import { CreateSecretaryForm } from "@/forms/CreateSecretaryForm";

export default async function NewSecretaryPage() {
  await requireRole("admin");

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 sm:p-8 lg:p-16">
      <h1 className="text-xl font-semibold sm:text-2xl">Add a new secretary</h1>
      <CreateSecretaryForm />
    </main>
  );
}
