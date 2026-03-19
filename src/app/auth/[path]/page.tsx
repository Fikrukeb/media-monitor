import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import Image from "next/image";
import Link from "next/link";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

const authClassNames = {
  base: "w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-800/80 backdrop-blur-sm shadow-2xl shadow-black/40 p-8",
  header: "space-y-2 text-center",
  title: "text-2xl font-bold text-white tracking-tight",
  description: "text-slate-400 text-sm",
  separator: "bg-slate-600",
  content: "space-y-6",
  form: {
    base: "space-y-5",
    input:
      "h-11 rounded-xl border border-slate-600 bg-slate-900/80 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors",
    label: "text-sm font-medium text-slate-300",
    primaryButton:
      "h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900",
    secondaryButton:
      "h-11 rounded-xl border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors",
    outlineButton:
      "h-11 rounded-xl border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors",
    providerButton:
      "h-11 rounded-xl border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-colors",
    forgotPasswordLink: "text-sm text-emerald-400 hover:text-emerald-300 transition-colors",
    error: "text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2",
  },
  continueWith: "text-slate-500 text-sm",
  footer: "mt-6 pt-6 border-t border-slate-700 text-center",
  footerLink: "text-emerald-400 hover:text-emerald-300 font-medium transition-colors",
};

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="auth-page-container relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Branding */}
        <Link
          href="/"
          className="flex flex-col items-center gap-3 mb-8 group"
        >
          <Image
            src="/logo.png"
            alt="AgriMonitor"
            width={64}
            height={64}
            className="shrink-0"
          />
          <span className="text-2xl font-bold text-emerald-400 tracking-tight group-hover:text-emerald-300 transition-colors">
            AgriMonitor
          </span>
          <span className="text-sm text-slate-500">
            Ethiopian Agriculture Media Monitoring
          </span>
        </Link>

        <AuthView path={path} classNames={authClassNames} />
      </div>
    </main>
  );
}
