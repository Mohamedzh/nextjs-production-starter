/**
 * User Menu Component
 * Displays user avatar and sign out option when authenticated
 */

"use client";

import { signOut, useSession } from "next-auth/react";
import { features } from "@/lib/features";
import Image from "next/image";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (!features.auth) {
    return null;
  }

  if (status === "loading") {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium text-gray-900">
          {session.user.name || "User"}
        </div>
        <div className="text-xs text-gray-500">{session.user.email}</div>
      </div>

      {session.user.image ? (
        <Image
          src={session.user.image}
          alt={session.user.name || "User"}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
          {session.user.name?.[0]?.toUpperCase() ||
            session.user.email?.[0]?.toUpperCase() ||
            "U"}
        </div>
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
