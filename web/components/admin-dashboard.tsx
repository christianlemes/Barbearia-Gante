'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  Scissors,
  Settings2,
  UserRound,
  UsersRound,
  XCircle,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { firebaseAdminEmail } from '@/lib/firebase-client';
import { changeAppointmentStatus as saveAppointmentStatus, friendlyFirebaseError, seedCatalog, subscribeAllAppointments, subscribeProfessionals, subscribeServices, updateCatalogActive } from '@/lib/firebase-data';
import type { AppointmentRecord, ProfessionalRecord, ServiceRecord } from '@/lib/gante-types';

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmado',
  completed: 'Concluído',
  canceled: 'Cancelado',
  no_show: 'Não compareceu',
};

function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function AdminDashboard() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const [tab, setTab] = useState<'agenda' | 'services' | 'professionals'>('agenda');
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalRecord[]>([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const isAdmin = Boolean(user?.email && firebaseAdminEmail && user.email.toLowerCase() === firebaseAdminEmail.toLowerCase());

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace('/app');
      return;
    }
    void seedCatalog().catch((nextError) => setError(friendlyFirebaseError(nextError)));
    const stopAppointments = subscribeAllAppointments(setAppointments, (nextError) => setError(friendlyFirebaseError(nextError)));
    const stopServices = subscribeServices(setServices, true);
    const stopProfessionals = subscribeProfessionals(setProfessionals, true);
    return () => {
      stopAppointments();
      stopServices();
      stopProfessionals();
    };
  }, [isAdmin, router, user]);

  const today = new Date().toISOString().slice(0, 10);
  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((item) => !query || [item.customer_name, item.customer_phone, item.service_name, item.professional_name].some((value) => value.toLowerCase().includes(query)));
  }, [appointments, search]);

  const stats = {
    today: appointments.filter((item) => item.appointment_date === today && item.status === 'confirmed').length,
    upcoming: appointments.filter((item) => item.appointment_date >= today && item.status === 'confirmed').length,
    completed: appointments.filter((item) => item.status === 'completed').length,
    canceled: appointments.filter((item) => item.status === 'canceled').length,
  };

  async function changeAppointmentStatus(id: string, status: AppointmentRecord['status']) {
    setBusy(id);
    setError('');
    try {
      const appointment = await saveAppointmentStatus(id, status);
      setAppointments((items) => items.map((item) => item.id === id ? appointment : item));
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setBusy('');
    }
  }

  async function toggleCatalog(kind: 'service' | 'professional', id: string, active: boolean) {
    setBusy(`${kind}-${id}`);
    setError('');
    try {
      await updateCatalogActive(kind, id, active);
      if (kind === 'service') setServices((items) => items.map((item) => item.id === id ? { ...item, active } : item));
      else setProfessionals((items) => items.map((item) => item.id === id ? { ...item, active } : item));
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="mt-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [CalendarCheck2, 'Hoje', stats.today, 'confirmados'],
          [Clock3, 'Próximos', stats.upcoming, 'na agenda'],
          [CheckCircle2, 'Concluídos', stats.completed, 'no histórico'],
          [XCircle, 'Cancelados', stats.canceled, 'no histórico'],
        ].map(([Icon, label, value, detail]) => {
          const StatIcon = Icon as typeof CalendarCheck2;
          return <article key={label as string} className="rounded-[22px] border border-[#d9d2c6] bg-[#fbf9f4] p-5"><StatIcon className="size-5 text-[#1a5a3d]" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#777b75]">{label as string}</p><p className="mt-1 font-serif text-4xl text-[#173b2b]">{value as number}</p><p className="text-xs text-[#868983]">{detail as string}</p></article>;
        })}
      </section>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex self-start rounded-full border border-[#d9d2c6] bg-[#ebe7de] p-1">
          {[
            ['agenda', CalendarCheck2, 'Agenda'],
            ['services', Scissors, 'Serviços'],
            ['professionals', UsersRound, 'Profissionais'],
          ].map(([value, Icon, label]) => {
            const TabIcon = Icon as typeof Scissors;
            return <button key={value as string} onClick={() => setTab(value as typeof tab)} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold ${tab === value ? 'bg-white text-[#174c35] shadow-sm' : 'text-[#70746e]'}`}><TabIcon className="size-3.5" />{label as string}</button>;
          })}
        </div>
        {tab === 'agenda' && <div className="relative w-full sm:max-w-xs"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#858983]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-full bg-white pl-11" placeholder="Buscar cliente ou serviço" /></div>}
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-[#f5e5e1] px-5 py-4 text-sm font-semibold text-[#8d3f33]">{error}</p>}

      {tab === 'agenda' && (
        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#d9d2c6] bg-[#fbf9f4]">
          {filteredAppointments.length ? filteredAppointments.map((item) => (
            <article key={item.id} className="grid gap-5 border-b border-[#e3ddd2] p-5 last:border-0 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center">
              <div><p className="font-serif text-2xl capitalize">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${item.appointment_date}T12:00:00`))}</p><p className="mt-1 text-sm font-bold text-[#92743b]">{item.appointment_time}</p></div>
              <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.customer_name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${item.status === 'confirmed' ? 'bg-[#e2eee6] text-[#18563b]' : item.status === 'completed' ? 'bg-[#e5e9e6] text-[#50685a]' : 'bg-[#eee3df] text-[#89483e]'}`}>{statusLabel[item.status] ?? item.status}</span></div><p className="mt-1 text-sm text-[#70746e]">{item.service_name} · {item.professional_name} · {money(item.price_cents)}</p><p className="mt-1 text-xs text-[#878a84]">{item.customer_phone} · {item.customer_email}</p></div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {busy === item.id ? <Loader2 className="size-5 animate-spin text-[#18563b]" /> : <>
                  {item.status === 'canceled' && <button onClick={() => void changeAppointmentStatus(item.id, 'confirmed')} className="h-9 rounded-full border border-[#d4cdbf] px-3 text-xs font-bold hover:bg-white">Reativar</button>}
                  {item.status === 'confirmed' && <button onClick={() => void changeAppointmentStatus(item.id, 'completed')} className="h-9 rounded-full bg-[#dfece3] px-3 text-xs font-bold text-[#18563b]">Concluir</button>}
                  {item.status === 'confirmed' && <button onClick={() => void changeAppointmentStatus(item.id, 'canceled')} className="h-9 rounded-full px-3 text-xs font-bold text-[#8d493f] hover:bg-[#f2e7e3]">Cancelar</button>}
                </>}
              </div>
            </article>
          )) : <div className="p-12 text-center"><CalendarCheck2 className="mx-auto size-8 text-[#a7aaa5]" /><h3 className="mt-4 font-serif text-2xl">Nenhum agendamento encontrado</h3><p className="mt-2 text-sm text-[#777b75]">Novas reservas aparecerão aqui automaticamente.</p></div>}
        </section>
      )}

      {tab === 'services' && (
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {services.map((item) => <article key={item.id} className="flex items-start gap-4 rounded-[22px] border border-[#d9d2c6] bg-[#fbf9f4] p-5"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e5eee8] text-[#18563b]"><Scissors className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-xs leading-5 text-[#747871]">{item.description}</p></div><Switch checked={Boolean(item.active)} disabled={busy === `service-${item.id}`} onCheckedChange={(active) => void toggleCatalog('service', item.id, active)} aria-label={`${item.active ? 'Desativar' : 'Ativar'} ${item.name}`} /></div><p className="mt-4 flex items-center justify-between text-sm"><span className="text-[#747871]">{item.duration_minutes} min</span><strong className="text-[#174c35]">{money(item.price_cents)}</strong></p></div></article>)}
        </section>
      )}

      {tab === 'professionals' && (
        <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((item) => <article key={item.id} className="rounded-[22px] border border-[#d9d2c6] bg-[#fbf9f4] p-5"><div className="flex items-start justify-between"><span className="grid size-14 place-items-center rounded-2xl bg-[#dce9e0] font-bold text-[#18563b]">{item.initials}</span><Switch checked={Boolean(item.active)} disabled={busy === `professional-${item.id}`} onCheckedChange={(active) => void toggleCatalog('professional', item.id, active)} aria-label={`${item.active ? 'Desativar' : 'Ativar'} ${item.name}`} /></div><h3 className="mt-5 font-bold">{item.name}</h3><p className="mt-1 text-xs leading-5 text-[#747871]">{item.role}</p>{item.rating && <p className="mt-3 text-xs font-bold text-[#92743b]">Avaliação {item.rating}</p>}</article>)}
        </section>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#d9d2c6] bg-[#f0ece4] px-5 py-4 text-xs text-[#70746e]"><Settings2 className="size-4 text-[#92743b]" /> Alterações feitas aqui são salvas no banco e refletidas no agendamento dos clientes.</div>
    </div>
  );
}
