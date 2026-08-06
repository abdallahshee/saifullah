import { ForgotPasswordForm } from "@/components/forms/auth/ForgotPasswordForm";


export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
        RESET ACCESS
      </p>
      <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">
        Forgot your password?
      </h2>
      <p className="mt-2 text-sm text-[var(--slate)]">
        Enter your email and we'll send you a link to reset it.
      </p>

      <ForgotPasswordForm />
    </div>
  );
}