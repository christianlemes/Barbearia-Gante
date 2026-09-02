'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Scissors,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';

import { Brand } from '@/components/brand';
import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBooking, friendlyFirebaseError, getUserProfile, subscribeOccupiedSlots, subscribeProfessionals, subscribeServices } from '@/lib/firebase-data';
import { defaultProfessionals, defaultServices, type AppointmentRecord } from '@/lib/gante-types';
import { cn } from '@/lib/utils';

const fallbackServices = defaultServices.map((item) => ({ ...item, duration: item.duration_minutes, price: item.price_cents / 100 }));
const preferenceOption =
  { id: 'any', name: 'Primeiro disponível', initials: '✓', role: 'Encontre o horário mais cedo', rating: null };

function upcomingDates() {
  const formatterWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
  const formatterMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
  const result: { id: string; iso: string; week: string; day: string; month: string; label: string }[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (result.length < 10) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 1) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      result.push({
        id: iso,
        iso,
        week: formatterWeek.format(cursor).replace('.', '').replace(/^./, (letter) => letter.toUpperCase()),
        day: String(cursor.getDate()).padStart(2, '0'),
        month: formatterMonth.format(cursor).replace('.', '').replace(/^./, (letter) => letter.toUpperCase()),
        label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

const dates = upcomingDates();

const times = ['09:00', '09:45', '10:30', '11:15', '13:30', '14:15', '16:00', '17:30', '19:00'];

const steps = ['Serviço', 'Profissional', 'Horário', 'Revisão'];

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function BookingFlow() {
  const router = useRouter();
  const { user, loading: authLoading, configured } = useFirebaseAuth();
  const [services, setServices] = useState(fallbackServices);
  const [availableProfessionals, setAvailableProfessionals] = useState(defaultProfessionals);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('any');
  const [dateId, setDateId] = useState('');
  const [time, setTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentRecord | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());

  const professionals = useMemo(
    () => [preferenceOption, ...availableProfessionals],
    [availableProfessionals],
  );

  const service = useMemo(() => services.find((item) => item.id === serviceId), [serviceId]);
  const professional = useMemo(() => professionals.find((item) => item.id === professionalId), [professionalId]);
  const date = useMemo(() => dates.find((item) => item.id === dateId), [dateId]);

  const canContinue = step === 0
    ? Boolean(service)
    : step === 1
      ? Boolean(professional)
      : step === 2
        ? Boolean(date && time)
        : Boolean(user && customerName.trim() && customerPhone.trim() && customerEmail.trim());

  useEffect(() => {
    if (!authLoading && configured && !user) router.replace('/entrar?returnTo=/agendar');
  }, [authLoading, configured, router, user]);

  useEffect(() => {
    if (!user) return;
    setCustomerName((value) => value || user.displayName || '');
    setCustomerEmail(user.email ?? '');
    void getUserProfile(user.uid).then((profile) => {
      if (profile?.name) setCustomerName(profile.name);
      if (profile?.phone) setCustomerPhone(profile.phone);
    });
    const unsubscribeServices = subscribeServices((items) => setServices(items.map((item) => ({ ...item, duration: item.duration_minutes, price: item.price_cents / 100 }))));
    const unsubscribeProfessionals = subscribeProfessionals(setAvailableProfessionals);
    return () => {
      unsubscribeServices();
      unsubscribeProfessionals();
    };
  }, [user]);

  useEffect(() => {
    const requestedService = new URLSearchParams(window.location.search).get('servico');
    if (requestedService && services.some((item) => item.id === requestedService)) setServiceId(requestedService);
  }, [services]);

  useEffect(() => {
    if (!date?.iso || !user) {
      setOccupiedSlots(new Set());
      return;
    }
    return subscribeOccupiedSlots(date.iso, setOccupiedSlots, (nextError) => setSubmitError(friendlyFirebaseError(nextError)));
  }, [date?.iso, user]);

  function timeUnavailable(candidate: string) {
    if (!date) return false;
    if (professionalId === 'any') {
      return availableProfessionals.length > 0 && availableProfessionals.every((item) => occupiedSlots.has(`${date.iso}_${item.id}_${candidate.replace(':', '')}`));
    }
    return occupiedSlots.has(`${date.iso}_${professionalId}_${candidate.replace(':', '')}`);
  }

  useEffect(() => {
    if (time && timeUnavailable(time)) setTime('');
  }, [occupiedSlots, professionalId]);

  async function persistBooking(input: {
    serviceId: string;
    professionalId: string;
    dateId: string;
    time: string;
    customerName: string;
    customerPhone: string;
  }) {
    if (!user) throw new Error('Entre na sua conta para confirmar o horário.');
    const selectedDate = dates.find((item) => item.id === input.dateId);
    const selectedService = services.find((item) => item.id === input.serviceId);
    if (!selectedDate) throw new Error('Data inválida.');
    if (!selectedService) throw new Error('Serviço inválido.');
    return createBooking({
      user,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      service: selectedService,
      professionalId: input.professionalId,
      professionals: availableProfessionals,
      appointmentDate: selectedDate.iso,
      appointmentTime: input.time,
    });
  }

  async function submitVisibleBooking() {
    if (!service || !professional || !date || !time || !canContinue) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const appointment = await persistBooking({
        serviceId: service.id,
        professionalId: professional.id,
        dateId: date.id,
        time,
        customerName,
        customerPhone,
      });
      setConfirmedAppointment(appointment);
      setConfirmed(true);
    } catch (error) {
      setSubmitError(friendlyFirebaseError(error));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    type WebMcpContext = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => Promise<unknown>;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };

    const context = (document as Document & { modelContext?: WebMcpContext }).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: 'create_gante_booking',
          title: 'Agendar na Gante Barbearia',
          description: 'Confirma um agendamento na unidade Parque Santos Dumont e atualiza a confirmação visível na página.',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: { type: 'string', enum: services.map((item) => item.id) },
              professionalId: { type: 'string', enum: professionals.map((item) => item.id) },
              dateId: { type: 'string', enum: dates.map((item) => item.id) },
              time: { type: 'string', enum: times },
              customerName: { type: 'string', minLength: 2 },
              customerPhone: { type: 'string', minLength: 8 },
            },
            required: ['serviceId', 'professionalId', 'dateId', 'time', 'customerName', 'customerPhone'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!input || typeof input !== 'object') throw new Error('Dados do agendamento são obrigatórios.');
            const value = input as Record<string, unknown>;
            const nextService = services.find((item) => item.id === value.serviceId);
            const nextProfessional = professionals.find((item) => item.id === value.professionalId);
            const nextDate = dates.find((item) => item.id === value.dateId);
            const nextTime = times.find((item) => item === value.time);
            if (!nextService || !nextProfessional || !nextDate || !nextTime) throw new Error('Serviço, profissional, data ou horário inválido.');
            if (!user) throw new Error('Entre na sua conta para confirmar o agendamento.');
            if (typeof value.customerName !== 'string' || typeof value.customerPhone !== 'string') throw new Error('Dados do cliente inválidos.');

            const appointment = await persistBooking({
              serviceId: nextService.id,
              professionalId: nextProfessional.id,
              dateId: nextDate.id,
              time: nextTime,
              customerName: value.customerName,
              customerPhone: value.customerPhone,
            });

            setServiceId(nextService.id);
            setProfessionalId(nextProfessional.id);
            setDateId(nextDate.id);
            setTime(nextTime);
            setCustomerName(value.customerName);
            setCustomerPhone(value.customerPhone);
            setCustomerEmail(user.email ?? '');
            setConfirmedAppointment(appointment);
            setConfirmed(true);
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            return {
              status: 'confirmed',
              service: nextService.name,
              professional: appointment.professional_name,
              date: nextDate.label,
              time: nextTime,
              unit: 'Parque Santos Dumont',
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, [availableProfessionals, services, user]);

  if (authLoading || (configured && !user)) {
    return <main className="grid min-h-screen place-items-center bg-[#f3f0e9]"><p className="text-sm font-semibold text-[#60655f]">Preparando seu agendamento...</p></main>;
  }

  if (!configured) {
    return <main className="grid min-h-screen place-items-center bg-[#f3f0e9] px-5"><div className="max-w-md rounded-[28px] border border-[#d9d2c6] bg-[#fbf9f4] p-8 text-center"><Brand className="justify-center" /><h1 className="mt-7 font-serif text-3xl">Firebase ainda não conectado</h1><p className="mt-3 text-sm leading-6 text-[#70746e]">A agenda será liberada assim que o projeto Firebase for vinculado.</p><Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#174c35] px-5 text-sm font-bold text-white">Voltar ao site</Link></div></main>;
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[#102a20] px-4 py-8 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Brand dark className="mb-12" />
          <section className="rounded-[32px] bg-[#fbf8f1] p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:p-12">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#dfece3] text-[#18573b]">
              <CheckCircle2 className="size-10" />
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#92743b]">Tudo certo</p>
            <h1 className="mt-3 font-serif text-4xl tracking-[-0.035em] text-[#173b2b] sm:text-5xl">Seu momento está reservado.</h1>
            <p className="mx-auto mt-4 max-w-md leading-7 text-[#6a6d67]">Enviamos os detalhes e o lembrete do seu horário. Se precisar, você poderá reagendar pela sua conta.</p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#dcd4c6] bg-white p-5 text-left">
              <div className="flex items-center justify-between border-b border-[#ebe6dd] pb-4">
                <div>
                  <p className="font-bold">{service?.name}</p>
                  <p className="mt-1 text-sm text-[#72766f]">com {confirmedAppointment?.professional_name ?? professional?.name}</p>
                </div>
                <span className="font-serif text-2xl text-[#1b563c]">{service && money(service.price)}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <span className="flex items-center gap-2"><CalendarDays className="size-4 text-[#9b7a38]" /> {date?.label}</span>
                <span className="flex items-center gap-2"><Clock3 className="size-4 text-[#9b7a38]" /> {time}</span>
                <span className="flex items-center gap-2 sm:col-span-2"><MapPin className="size-4 text-[#9b7a38]" /> Parque Santos Dumont</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/agendamentos" className="inline-flex h-12 items-center justify-center rounded-full bg-[#174c35] px-6 font-semibold text-white hover:bg-[#103a28]">Ver meus agendamentos</Link>
              <Link href="/app" className="inline-flex h-12 items-center justify-center rounded-full border border-[#d0c8ba] bg-white px-6 font-semibold hover:bg-[#f5f1e9]">Voltar ao início</Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#17251f]">
      <header className="border-b border-[#dcd5c9] bg-[#fbf9f4]">
        <div className="mx-auto flex h-20 max-w-[1380px] items-center justify-between px-4 sm:px-8">
          <Brand />
          <Link href="/app" className="inline-flex items-center gap-2 text-sm font-semibold text-[#626760] hover:text-[#184b36]">
            <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Sair do agendamento</span><span className="sm:hidden">Sair</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">Novo agendamento</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-0.035em] text-[#173b2b] sm:text-5xl">Reserve seu momento</h1>
          <p className="mt-2 text-sm text-[#6d716b]">Quatro passos simples. Suas escolhas ficam salvas enquanto você avança.</p>
        </div>

        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progresso do agendamento">
          {steps.map((label, index) => (
            <li key={label} className="min-w-0">
              <span className={cn('mb-2 block h-1.5 rounded-full transition-colors', index <= step ? 'bg-[#1c5b40]' : 'bg-[#d7d1c6]')} />
              <span className={cn('hidden text-xs font-semibold sm:block', index <= step ? 'text-[#1c5b40]' : 'text-[#8c8e89]')}>{index + 1}. {label}</span>
              <span className={cn('block text-center text-[10px] font-bold sm:hidden', index === step ? 'text-[#1c5b40]' : 'text-[#8c8e89]')}>{index + 1}</span>
            </li>
          ))}
        </ol>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[28px] border border-[#ddd5c8] bg-[#fbf9f4] p-5 shadow-[0_16px_50px_rgba(30,48,38,.06)] sm:p-8">
            {step === 0 && (
              <div>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#877447]">Etapa 1</p>
                    <h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Escolha seu serviço</h2>
                    <p className="mt-2 text-sm text-[#70746e]">Preço e duração visíveis desde o início.</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e4eee7] text-[#1a593d]"><Scissors className="size-5" /></span>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {services.map((item) => {
                    const selected = serviceId === item.id;
                    return (
                      <button key={item.id} type="button" onClick={() => setServiceId(item.id)} className={cn('relative flex min-h-[138px] flex-col rounded-2xl border p-5 text-left transition-all', selected ? 'border-[#1b5b3e] bg-[#edf4ef] shadow-[0_10px_24px_rgba(24,75,52,.08)]' : 'border-[#ddd7cc] bg-white hover:-translate-y-0.5 hover:border-[#aabaac] hover:shadow-md')}>
                        <span className="flex items-start justify-between gap-4">
                          <span className="font-bold">{item.name}</span>
                          <span className={cn('grid size-5 place-items-center rounded-full border', selected ? 'border-[#1b5b3e] bg-[#1b5b3e] text-white' : 'border-[#bbb7ae]')}>
                            {selected && <Check className="size-3" strokeWidth={3} />}
                          </span>
                        </span>
                        <span className="mt-1 text-xs leading-5 text-[#73776f]">{item.description}</span>
                        <span className="mt-auto flex items-end justify-between pt-4">
                          <span className="flex items-center gap-1.5 text-xs text-[#73776f]"><Clock3 className="size-3.5" /> {item.duration} min</span>
                          <span className="font-serif text-xl text-[#174c35]">{money(item.price)}</span>
                        </span>
                        {item.popular && <span className="absolute -top-2 left-4 rounded-full bg-[#d6b566] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#283c31]">Em alta</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#877447]">Etapa 2</p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Com quem você prefere?</h2>
                <p className="mt-2 text-sm text-[#70746e]">Escolha um profissional ou encontre o primeiro horário disponível.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {professionals.map((item, index) => {
                    const selected = professionalId === item.id;
                    return (
                      <button key={item.id} type="button" onClick={() => setProfessionalId(item.id)} className={cn('relative rounded-2xl border p-5 text-left transition-all', selected ? 'border-[#1b5b3e] bg-[#edf4ef]' : 'border-[#ddd7cc] bg-white hover:border-[#aabaac]')}>
                        <span className={cn('grid size-16 place-items-center rounded-2xl text-lg font-bold', index === 0 ? 'bg-[#173b2b] text-[#e6c77f]' : index === 1 ? 'bg-[#d8e8dd] text-[#184b36]' : 'bg-[#e9dfc4] text-[#6f5727]')}>{item.initials}</span>
                        <span className="mt-5 flex items-center justify-between gap-2">
                          <span className="font-bold">{item.name}</span>
                          {item.rating && <span className="flex items-center gap-1 text-xs font-bold"><Star className="size-3 fill-[#c9a852] text-[#c9a852]" />{item.rating}</span>}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#73776f]">{item.role}</span>
                        {selected && <CheckCircle2 className="absolute right-4 top-4 size-5 text-[#1b5b3e]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#877447]">Etapa 3</p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Quando fica melhor?</h2>
                <p className="mt-2 text-sm text-[#70746e]">Próximas datas disponíveis na unidade.</p>
                <h3 className="mt-8 text-sm font-bold">Escolha a data</h3>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {dates.map((item) => {
                    const selected = dateId === item.id;
                    return (
                      <button key={item.id} type="button" onClick={() => { setDateId(item.id); setTime(''); }} className={cn('rounded-2xl border px-2 py-4 text-center transition-colors', selected ? 'border-[#1b5b3e] bg-[#1b5b3e] text-white' : 'border-[#ddd7cc] bg-white hover:border-[#aabaac]')}>
                        <span className={cn('block text-xs', selected ? 'text-white/70' : 'text-[#777b75]')}>{item.week}</span>
                        <span className="mt-1 block font-serif text-2xl">{item.day}</span>
                        <span className={cn('block text-[10px]', selected ? 'text-white/70' : 'text-[#777b75]')}>{item.month}</span>
                      </button>
                    );
                  })}
                </div>
                <h3 className="mt-8 text-sm font-bold">Horário</h3>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {times.map((item) => (
                    <button key={item} type="button" disabled={!dateId || timeUnavailable(item)} onClick={() => setTime(item)} className={cn('h-12 rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35', time === item ? 'border-[#1b5b3e] bg-[#e5eee8] text-[#154a33]' : 'border-[#ddd7cc] bg-white hover:border-[#aabaac]')}>
                      {item}{timeUnavailable(item) && <span className="block text-[9px] font-medium">Ocupado</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#877447]">Última etapa</p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Confira e confirme</h2>
                <p className="mt-2 text-sm text-[#70746e]">Precisamos apenas dos dados para enviar sua confirmação.</p>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="booking-name">Nome completo</Label>
                    <Input id="booking-name" required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="h-12 rounded-xl bg-white px-4" placeholder="Como podemos chamar você?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-phone">WhatsApp</Label>
                    <Input id="booking-phone" type="tel" required value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="h-12 rounded-xl bg-white px-4" placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-email">E-mail</Label>
                    <Input id="booking-email" type="email" required readOnly value={customerEmail} className="h-12 rounded-xl bg-[#f1eee8] px-4 text-[#6b7069]" placeholder="voce@email.com" />
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-[#e1d8c8] bg-[#f2ead7] p-4 text-sm leading-6 text-[#5f573f]">
                  <span className="flex gap-3"><Sparkles className="mt-1 size-4 shrink-0 text-[#96752f]" /> Este serviço pode sair mais em conta com um plano. Você poderá conhecer as opções depois de confirmar, sem perder suas escolhas.</span>
                </div>
              </div>
            )}

            <div className="mt-9 flex items-center justify-between border-t border-[#e3ddd2] pt-6">
              <Button variant="ghost" className={cn('h-11 rounded-full px-4', step === 0 && 'invisible')} onClick={() => setStep((value) => Math.max(0, value - 1))}>
                <ArrowLeft /> Voltar
              </Button>
              <Button disabled={!canContinue || submitting} className="h-11 rounded-full bg-[#174c35] px-6 hover:bg-[#103a28]" onClick={() => step === 3 ? void submitVisibleBooking() : setStep((value) => Math.min(3, value + 1))}>
                {submitting ? 'Confirmando...' : step === 3 ? 'Confirmar agendamento' : 'Continuar'} {!submitting && <ArrowRight />}
              </Button>
            </div>
            {submitError && <p role="alert" className="mt-4 rounded-xl bg-[#f5e5e1] px-4 py-3 text-sm font-semibold text-[#8d3f33]">{submitError}</p>}
          </section>

          <aside className="sticky top-6 rounded-[24px] border border-[#ddd5c8] bg-[#173b2b] p-6 text-white shadow-[0_18px_54px_rgba(23,59,43,.16)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d6bb78]">Seu agendamento</p>
            <h2 className="mt-2 font-serif text-2xl">Resumo</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><Scissors className="size-4 text-[#e0c174]" /></span>
                <span><span className="block text-white/55">Serviço</span><span className="mt-0.5 block font-semibold">{service?.name ?? 'Ainda não escolhido'}</span></span>
              </div>
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><UserRound className="size-4 text-[#e0c174]" /></span>
                <span><span className="block text-white/55">Profissional</span><span className="mt-0.5 block font-semibold">{step > 0 ? professional?.name : 'Escolha na próxima etapa'}</span></span>
              </div>
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><CalendarDays className="size-4 text-[#e0c174]" /></span>
                <span><span className="block text-white/55">Data e horário</span><span className="mt-0.5 block font-semibold">{date && time ? `${date.label} · ${time}` : 'A definir'}</span></span>
              </div>
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><MapPin className="size-4 text-[#e0c174]" /></span>
                <span><span className="block text-white/55">Unidade</span><span className="mt-0.5 block font-semibold">Parque Santos Dumont</span></span>
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
              <span className="text-sm text-white/60">Total</span>
              <span className="font-serif text-3xl text-[#f0d28c]">{service ? money(service.price) : '—'}</span>
            </div>
            <p className="mt-2 text-right text-[11px] text-white/45">Pagamento realizado na barbearia.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
