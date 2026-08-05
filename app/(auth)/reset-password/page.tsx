import { ResetPasswordForm } from "@/components/forms/auth/ResetPasswordForm";


export default function ResetPasswordPage() {
  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
        RESET ACCESS
      </p>
      <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">
        Set a new password
      </h2>
      <p className="mt-2 text-sm text-[var(--slate)]">
        Choose a new password for your account.
      </p>

      <ResetPasswordForm />
    </div>
  );
}