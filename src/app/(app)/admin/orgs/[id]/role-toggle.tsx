"use client";

import { useTransition } from "react";
import { changeUserRole } from "@/lib/actions/admin";

export function RoleToggle({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newRole = currentRole === "admin" ? "user" : "admin";
    startTransition(async () => {
      await changeUserRole(userId, newRole);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        currentRole === "admin"
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      } ${isPending ? "opacity-50" : ""}`}
    >
      {isPending ? "..." : currentRole === "admin" ? "Admin" : "User"}
    </button>
  );
}
