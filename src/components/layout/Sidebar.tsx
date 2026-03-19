"use client";

import { SignedOut } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfileCard } from "./UserProfileCard";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/articles", label: "Articles", icon: "📰" },
  { href: "/sources", label: "Sources", icon: "🔗" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-100 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-emerald-400">
          AgriMonitor
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ethiopian Agriculture
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 space-y-3">
        <UserProfileCard />
        <SignedOut>
          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        </SignedOut>
        <p className="text-xs text-slate-500">Media Monitoring v1.0</p>
      </div>
    </aside>
  );
}
