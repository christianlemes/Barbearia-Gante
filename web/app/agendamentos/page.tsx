import Link from 'next/link';
import { Scissors } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { AppointmentsClient } from '@/components/appointments-client';
import { DashboardHeader } from '@/components/dashboard-header';

export default function AppointmentsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DashboardHeader
          eyebrow="Sua agenda"
          title="Meus agendamentos"
          description="Acompanhe próximos horários, cancele quando necessário e consulte seu histórico."
          action={<Link href="/agendar" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#174c35] px-6 text-sm font-bold text-white hover:bg-[#103a28]"><Scissors className="size-4" /> Novo agendamento</Link>}
        />
        <AppointmentsClient />
      </div>
    </AppShell>
  );
}
