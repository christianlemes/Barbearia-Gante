import { AppShell } from '@/components/app-shell';
import { AdminDashboard } from '@/components/admin-dashboard';
import { DashboardHeader } from '@/components/dashboard-header';

export default function AdminPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DashboardHeader eyebrow="Gestão Gante" title="Administração" description="Agenda, catálogo e equipe em um só lugar, sincronizados com o Firebase." />
        <AdminDashboard />
      </div>
    </AppShell>
  );
}
