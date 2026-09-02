"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="text-sm bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5"
    >
      Log out
    </button>
  );
}
