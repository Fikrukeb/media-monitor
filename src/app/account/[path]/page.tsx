import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Account</h1>
        <div className="max-w-2xl rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
          <AccountView path={path} />
        </div>
      </div>
    </DashboardLayout>
  );
}
