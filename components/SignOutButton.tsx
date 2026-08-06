// components/sign-out-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);

    const supabase = createClient();
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setSigningOut(false);
      return;
    }

    // Clear any cached server-rendered data tied to the old session, then
    // send the user back to login. router.refresh() ensures layouts like
    // (app)/layout.tsx re-run getCurrentProfile() and see the signed-out
    // state rather than serving a stale cached tree.
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="btn btn-ghost btn-sm gap-2 text-[var(--slate)] hover:text-[var(--ink)]"
      >
        {signingOut ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {signingOut ? "Signing out..." : "Sign out"}
      </button>

      {error && (
        <div
          role="alert"
          className="alert alert-error absolute right-0 top-full mt-2 w-64 text-xs shadow-lg z-10"
        >
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}