'use client';

import Link from 'next/link';
import { Scissors } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard-header';
import { useFirebaseAuth } from '@/components/firebase-auth-provider';

export function DashboardWelcome() {
  const { user } = useFirebaseAuth();
  const firstName = (user?.displayName || user?.email?.split('@')[0] || 'cliente').split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <DashboardHeader
      eyebrow={date.replace(/^./, (letter) => letter.toUpperCase())}
      title={`${greeting}, ${firstName}.`}
      description="Seu próximo momento Gante está organizado."
      action={
        <Link href="/agendar" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#174c35] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(23,76,53,.18)] hover:bg-[#103a28]">
          <Scissors className="size-4" /> Agendar horário
        </Link>
      }
    />
  );
}
