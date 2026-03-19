"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function getInitials(name: string, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() ?? "?";
}

export function UserProfileCard() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    setOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/auth/sign-in"),
      },
    });
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (isPending || !session?.user) return null;

  const { user } = session;
  const initials = getInitials(user.name ?? "", user.email ?? "");

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="relative flex-shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "Avatar"}
              className="h-9 w-9 rounded-lg object-cover ring-2 ring-slate-600 group-hover:ring-emerald-500/50 transition-all"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-semibold text-white ring-2 ring-slate-600 group-hover:ring-emerald-500/50 transition-all">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-800" title="Online" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-slate-100 truncate">
            {user.name || "User"}
          </p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <svg
          className={`h-4 w-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 py-1 rounded-xl border border-slate-700 bg-slate-800/95 backdrop-blur-sm shadow-xl shadow-black/20 profile-menu-enter"
          role="menu"
        >
          <div className="px-2 py-1.5 border-b border-slate-700/80">
            <p className="text-xs text-slate-500 px-2">Account</p>
          </div>
          <Link
            href="/account/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors mx-1 my-0.5"
            role="menuitem"
          >
            <span className="text-slate-500">👤</span>
            Profile
          </Link>
          <Link
            href="/account/security"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors mx-1 my-0.5"
            role="menuitem"
          >
            <span className="text-slate-500">⚙️</span>
            Settings
          </Link>
          <div className="border-t border-slate-700/80 mt-1 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mx-1"
              role="menuitem"
            >
              <span>🚪</span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
