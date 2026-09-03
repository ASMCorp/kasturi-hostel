"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Unable to log out. Please try again.");
      }

      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to log out. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        aria-disabled={pending}
        aria-busy={pending}
        className="btn-secondary whitespace-nowrap"
      >
        {pending && <LoadingSpinner label="Logging out" />}
        <span>{pending ? "Logging out…" : "Log out"}</span>
      </button>
      <p
        aria-live="assertive"
        className={`absolute right-0 top-full z-10 mt-2 w-64 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-800 shadow-card ${
          error ? "block" : "hidden"
        }`}
      >
        {error}
      </p>
    </div>
  );
}
