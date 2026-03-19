"use client";

import { Sidebar } from "./Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        {children}
      </main>
    </div>
  );
}
