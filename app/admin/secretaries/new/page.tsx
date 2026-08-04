import { requireRole } from "@/lib/auth/current-profile";
import { AdmitSecretaryForm } from "@/components/AdmitSecretaryForm";

export default async function NewSecretaryPage() {
  await requireRole("admin");

  return (
    <main className="flex flex-1 flex-col gap-6 p-16">
      <h1 className="text-2xl font-semibold">Add a new secretary</h1>
      <AdmitSecretaryForm />
    </main>
  );
}
