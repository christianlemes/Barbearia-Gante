'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  History,
  Loader2,
  MapPin,
  Scissors,
  UserRound,
  X,
} from 'lucide-react';

import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { cancelBooking, friendlyFirebaseError, subscribeCustomerAppointments } from '@/lib/firebase-data';
import type { AppointmentRecord } from '@/lib/gante-types';

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  completed: 'Concluído',
  canceled: 'Cancelado',
  no_show: 'Não compareceu',
};

function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`));
}

export function AppointmentsClient() {
  const { user } = useFirebaseAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState('');
  const [pendingCancel, setPendingCancel] = useState<AppointmentRecord | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeCustomerAppointments(
      user.uid,
      (items) => {
        setAppointments(items);
        setLoading(false);
      },
      (nextError) => {
        setError(friendlyFirebaseError(nextError));
        setLoading(false);
      },
    );
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = useMemo(
    () => appointments.filter((item) => ['confirmed', 'pending'].includes(item.status) && item.appointment_date >= today).sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`)),
    [appointments, today],
  );
  const history = useMemo(
    () => appointments
      .filter((item) => !['confirmed', 'pending'].includes(item.status) || item.appointment_date < today)
      .sort((a, b) => `${b.appointment_date}${b.appointment_time}`.localeCompare(`${a.appointment_date}${a.appointment_time}`)),
    [appointments, today],
  );
  const visible = tab === 'upcoming' ? upcoming : history;

  async function cancelAppointment(id: string) {
    setCancelingId(id);
    setError('');
    try {
      if (!user) throw new Error('Entre novamente para cancelar este horário.');
      const appointment = await cancelBooking(id, user.uid);
      setAppointments((items) => items.map((item) => item.id === id ? appointment : item));
      setPendingCancel(null);
      setTab('history');
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setCancelingId('');
    }
  }

  return (
    <>
      <div className="mt-8 inline-flex rounded-full border border-[#d9d2c6] bg-[#ebe7de] p-1">
        <button onClick={() => setTab('upcoming')} className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${tab === 'upcoming' ? 'bg-white text-[#174c35] shadow-sm' : 'text-[#70746e]'}`}>Próximos <span className="ml-1 text-[#8a8e87]">{upcoming.length}</span></button>
        <button onClick={() => setTab('history')} className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${tab === 'history' ? 'bg-white text-[#174c35] shadow-sm' : 'text-[#70746e]'}`}>Histórico <span className="ml-1 text-[#8a8e87]">{history.length}</span></button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-[#f5e5e1] px-5 py-4 text-sm font-semibold text-[#8d3f33]">{error}</p>}

      {loading ? (
        <div className="mt-8 flex min-h-64 items-center justify-center rounded-[28px] border border-[#d8d0c3] bg-[#fbf9f4]"><Loader2 className="size-6 animate-spin text-[#18563b]" /><span className="ml-3 text-sm text-[#70746e]">Carregando sua agenda...</span></div>
      ) : visible.length ? (
        <section className="mt-6 space-y-4">
          {visible.map((appointment) => (
            <article key={appointment.id} className="overflow-hidden rounded-[28px] border border-[#d8d0c3] bg-[#fbf9f4] shadow-[0_18px_50px_rgba(27,58,43,.06)]">
              <div className="grid md:grid-cols-[210px_minmax(0,1fr)]">
                <div className={`flex items-center gap-4 p-6 text-white md:flex-col md:items-start md:justify-center md:p-8 ${appointment.status === 'canceled' ? 'bg-[#6e625c]' : appointment.status === 'completed' ? 'bg-[#506b5b]' : 'bg-[#173b2b]'}`}>
                  {tab === 'history' ? <History className="size-7 text-[#e0c174]" /> : <CalendarCheck2 className="size-7 text-[#e0c174]" />}
                  <div><p className="text-sm capitalize text-white/60">{dateLabel(appointment.appointment_date).split(',')[0]}</p><p className="mt-1 font-serif text-3xl capitalize">{dateLabel(appointment.appointment_date).split(',')[1]}</p><p className="mt-1 text-lg font-bold text-[#f0d28c]">{appointment.appointment_time}</p></div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${appointment.status === 'canceled' ? 'bg-[#eee3df] text-[#89483e]' : appointment.status === 'completed' ? 'bg-[#e2ebe5] text-[#2d6547]' : 'bg-[#e2eee6] text-[#18563b]'}`}>{statusLabel[appointment.status] ?? appointment.status}</span>
                      <h2 className="mt-4 font-serif text-3xl tracking-[-0.025em]">{appointment.service_name}</h2>
                      <div className="mt-5 grid gap-3 text-sm text-[#60655f] sm:grid-cols-2">
                        <span className="flex items-center gap-2"><UserRound className="size-4 text-[#9b7a38]" /> Com {appointment.professional_name}</span>
                        <span className="flex items-center gap-2"><Clock3 className="size-4 text-[#9b7a38]" /> {appointment.duration_minutes} minutos</span>
                        <span className="flex items-center gap-2 sm:col-span-2"><MapPin className="size-4 text-[#9b7a38]" /> {appointment.unit_address}</span>
                      </div>
                    </div>
                    <p className="font-serif text-3xl text-[#174c35]">{money(appointment.price_cents)}</p>
                  </div>
                  {appointment.status === 'canceled' && appointment.cancel_reason && <p className="mt-5 rounded-xl bg-[#f2ebe7] px-4 py-3 text-sm text-[#78635d]">Motivo: {appointment.cancel_reason}</p>}
                  {appointment.status === 'confirmed' && (
                    <div className="mt-7 flex flex-wrap gap-3 border-t border-[#e7e1d8] pt-5">
                      <Link href={`/agendar?servico=${appointment.service_id}`} className="inline-flex h-10 items-center rounded-full border border-[#d2cabd] bg-white px-4 text-sm font-semibold hover:bg-[#f2eee7]">Agendar outro</Link>
                      <button disabled={cancelingId === appointment.id} onClick={() => setPendingCancel(appointment)} className="h-10 rounded-full px-4 text-sm font-semibold text-[#8e493e] hover:bg-[#f4e7e3] disabled:opacity-50">{cancelingId === appointment.id ? 'Cancelando...' : 'Cancelar horário'}</button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cfc7bb] bg-[#fbf9f4] px-6 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-[#e5eee8] text-[#18563b]">{tab === 'upcoming' ? <CalendarDays className="size-7" /> : <History className="size-7" />}</span>
          <h2 className="mt-5 font-serif text-3xl">{tab === 'upcoming' ? 'Nenhum horário marcado' : 'Seu histórico está vazio'}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#70746e]">{tab === 'upcoming' ? 'Escolha um serviço e encontre o melhor momento para cuidar do seu estilo.' : 'Agendamentos concluídos e cancelados aparecerão aqui.'}</p>
          {tab === 'upcoming' && <Link href="/agendar" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#174c35] px-5 text-sm font-bold text-white"><Scissors className="size-4" /> Agendar agora</Link>}
        </section>
      )}

      {pendingCancel && (
        <dialog open aria-labelledby="cancel-title" className="fixed inset-0 z-[80] m-0 grid size-full max-h-none max-w-none place-items-center border-0 bg-[#08160f]/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-[28px] bg-[#fbf9f4] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f1e4df] text-[#8d493f]"><AlertTriangle className="size-5" /></span>
              <button type="button" disabled={Boolean(cancelingId)} onClick={() => setPendingCancel(null)} aria-label="Fechar cancelamento" className="grid size-10 place-items-center rounded-full hover:bg-[#eee9df] disabled:opacity-50"><X className="size-5" /></button>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">Confirme sua escolha</p>
            <h2 id="cancel-title" className="mt-2 font-serif text-3xl">Cancelar este horário?</h2>
            <p className="mt-3 text-sm leading-6 text-[#70746e]">{pendingCancel.service_name} com {pendingCancel.professional_name}, em {dateLabel(pendingCancel.appointment_date)} às {pendingCancel.appointment_time}. O registro continuará disponível no histórico.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={Boolean(cancelingId)} onClick={() => setPendingCancel(null)} className="h-12 rounded-full border border-[#d3ccbf] bg-white text-sm font-bold hover:bg-[#f2eee7] disabled:opacity-50">Manter horário</button>
              <button type="button" disabled={Boolean(cancelingId)} onClick={() => void cancelAppointment(pendingCancel.id)} className="inline-flex h-12 items-center justify-center rounded-full bg-[#8d493f] text-sm font-bold text-white hover:bg-[#733a32] disabled:opacity-50">{cancelingId ? <><Loader2 className="mr-2 size-4 animate-spin" /> Cancelando</> : 'Sim, cancelar'}</button>
            </div>
          </section>
        </dialog>
      )}
    </>
  );
}
