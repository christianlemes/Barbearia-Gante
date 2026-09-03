import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Crown,
  Scissors,
  Sparkles,
  TicketPercent,
  UserRound,
} from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { DashboardWelcome } from '@/components/dashboard-welcome';
import { NextAppointmentCard } from '@/components/next-appointment-card';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1260px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DashboardWelcome />

        <section className="mt-9 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(310px,.6fr)]">
          <NextAppointmentCard />

          <article className="rounded-[28px] border border-[#dcd4c7] bg-[#fbf9f4] p-6 sm:p-8">
            <span className="grid size-11 place-items-center rounded-full bg-[#eee4c8] text-[#806426]"><Crown className="size-5" /></span>
            <h2 className="mt-5 font-serif text-3xl tracking-[-0.025em] text-[#173b2b]">Seu plano</h2>
            <p className="mt-2 text-sm leading-6 text-[#6d716b]">Você ainda não possui um plano. Economize nos seus cuidados recorrentes.</p>
            <Link href="/planos" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#18563b] hover:gap-3">Conhecer planos <ArrowRight className="size-4" /></Link>
          </article>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Link href="/clube" className="group relative overflow-hidden rounded-[28px] border border-[#d7cba8] bg-[#efe5c9] p-6 sm:p-8">
            <div className="absolute right-0 top-0 size-48 rounded-full bg-[#c5a34d]/15 blur-3xl" />
            <span className="relative grid size-11 place-items-center rounded-full bg-[#173b2b] text-[#e5c778]"><TicketPercent className="size-5" /></span>
            <h2 className="relative mt-8 font-serif text-3xl tracking-[-0.025em]">Clube Gante</h2>
            <p className="relative mt-2 max-w-md text-sm leading-6 text-[#655e4c]">Benefícios em gastronomia, cuidados, lazer e serviços para aproveitar além da barbearia.</p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#174c35] transition-all group-hover:gap-3">Explorar benefícios <ArrowRight className="size-4" /></span>
          </Link>

          <article className="rounded-[28px] border border-[#dcd4c7] bg-[#fbf9f4] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">Ações rápidas</p>
                <h2 className="mt-2 font-serif text-3xl">Tudo em poucos toques</h2>
              </div>
              <Sparkles className="size-6 text-[#ad8c44]" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['/agendar', Scissors, 'Agendar'],
                ['/agendamentos', CalendarDays, 'Horários'],
                ['/perfil', UserRound, 'Meu perfil'],
              ].map(([href, Icon, label]) => {
                const ActionIcon = Icon as typeof Scissors;
                return (
                  <Link key={label as string} href={href as string} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-[#e1dbd0] bg-white px-2 text-center text-xs font-bold transition-all hover:-translate-y-0.5 hover:border-[#a8b9ac] hover:shadow-md">
                    <ActionIcon className="size-5 text-[#1b5a3e]" /> {label as string}
                  </Link>
                );
              })}
            </div>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">Para o seu estilo</p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">Serviços mais escolhidos</h2>
            </div>
            <Link href="/agendar" className="hidden items-center gap-2 text-sm font-bold text-[#18563b] sm:flex">Ver todos <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['Corte Gante', '45 min', 'R$ 50'],
              ['Barba premium', '40 min', 'R$ 45'],
              ['Corte + barba', '1h 15', 'R$ 90'],
            ].map(([name, duration, price]) => (
              <Link key={name} href="/agendar" className="group rounded-[22px] border border-[#ddd6ca] bg-[#fbf9f4] p-5 transition-all hover:-translate-y-0.5 hover:border-[#a8b7aa] hover:shadow-lg">
                <span className="flex items-center justify-between"><Scissors className="size-5 text-[#1b5a3e]" /><ArrowRight className="size-4 text-[#a8aaa5] transition-transform group-hover:translate-x-1" /></span>
                <h3 className="mt-7 font-bold">{name}</h3>
                <span className="mt-2 flex items-center justify-between text-sm text-[#72766f]"><span>{duration}</span><strong className="font-serif text-xl font-normal text-[#174c35]">{price}</strong></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
