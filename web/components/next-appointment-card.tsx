'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock3, Loader2, MapPin, Scissors } from 'lucide-react';

import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { subscribeCustomerAppointments } from '@/lib/firebase-data';
import type { AppointmentRecord } from '@/lib/gante-types';

export function NextAppointmentCard() {
  const { user } = useFirebaseAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return subscribeCustomerAppointments(user.uid, (items) => {
      setAppointments(items);
      setLoading(false);
    }, () => setLoading(false));
  }, [user]);

  const next = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments
      .filter((item) => item.status === 'confirmed' && item.appointment_date >= today)
      .sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`))[0];
  }, [appointments]);

  if (loading) {
    return <article className="flex min-h-[290px] items-center justify-center rounded-[28px] bg-[#173b2b] text-white"><Loader2 className="size-6 animate-spin text-[#e0c174]" /><span className="ml-3 text-sm text-white/60">Consultando sua agenda...</span></article>;
  }

  if (!next) {
    return (
      <article className="relative overflow-hidden rounded-[28px] bg-[#173b2b] p-6 text-white shadow-[0_24px_70px_rgba(23,59,43,.16)] sm:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e0c174]"><CalendarDays className="size-4" /> Sua agenda</p>
        <h2 className="mt-6 max-w-xl font-serif text-4xl tracking-[-0.035em]">Seu próximo momento ainda está em aberto.</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">Escolha o serviço, profissional e horário. A reserva ficará salva nesta conta.</p>
        <Link href="/agendar" className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[#e0c174] px-5 text-sm font-bold text-[#173b2b]"><Scissors className="size-4" /> Agendar agora</Link>
      </article>
    );
  }

  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date(`${next.appointment_date}T12:00:00`));
  return (
    <article className="relative overflow-hidden rounded-[28px] bg-[#173b2b] p-6 text-white shadow-[0_24px_70px_rgba(23,59,43,.16)] sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#caa95a]/10 blur-2xl" />
      <div className="relative flex h-full min-h-[225px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e0c174]"><CalendarDays className="size-4" /> Próximo agendamento</p><h2 className="mt-5 font-serif text-4xl capitalize tracking-[-0.035em]">{date}</h2><p className="mt-2 text-base text-white/65">{next.service_name} com {next.professional_name}</p><div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80"><span className="flex items-center gap-2"><Clock3 className="size-4 text-[#e0c174]" /> {next.appointment_time}</span><span className="flex items-center gap-2"><MapPin className="size-4 text-[#e0c174]" /> {next.unit_name}</span></div></div>
        <Link href="/agendamentos" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#e0c174] px-5 text-sm font-bold text-[#173b2b]">Gerenciar horário</Link>
      </div>
    </article>
  );
}
