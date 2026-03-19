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
    <aside className="w-64 h-screen sticky top-0 flex flex-col shrink-0 bg-slate-900/95 backdrop-blur-sm text-slate-100 border-r border-slate-700/80">
      <div className="shrink-0 p-6 border-b border-slate-700/80">
        <Link href="/" className="block group">
          <h1 className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            AgriMonitor
          </h1>
          <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">
            Ethiopian Agriculture
          </p>
        </Link>
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
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
      <div className="shrink-0 p-4 border-t border-slate-700/80 space-y-3">
        <UserProfileCard />
        <SignedOut>
          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            Sign In
          </Link>
        </SignedOut>
        <p className="text-xs text-slate-500 pt-1">Powered by SESM Technology Group</p>
      </div>
    </aside>
  );
}
