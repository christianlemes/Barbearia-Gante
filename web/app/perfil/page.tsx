import { AppShell } from '@/components/app-shell';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProfileForm } from '@/components/profile-form';

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1040px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DashboardHeader eyebrow="Sua conta" title="Perfil e preferências" description="Mantenha seus dados atualizados e escolha como deseja receber lembretes." />
        <ProfileForm />
      </div>
    </AppShell>
  );
}
