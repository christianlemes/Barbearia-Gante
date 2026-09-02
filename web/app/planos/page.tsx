import Link from 'next/link';
import { Check, Crown, Info, Scissors, Sparkles } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { DashboardHeader } from '@/components/dashboard-header';

const plans = [
  { name: 'Corte em dia', price: '89,99', description: 'Para quem gosta de manter o corte sempre alinhado.', features: ['Cortes ilimitados', 'Agendamento prioritário', 'Benefícios no Clube Gante'], recommended: false },
  { name: 'Experiência completa', price: '179,99', description: 'Cabelo e barba com liberdade para cuidar do visual.', features: ['Cortes ilimitados', 'Barbas ilimitadas', 'Prioridade e Clube Gante'], recommended: true },
  { name: 'Barba impecável', price: '139,99', description: 'Cuidado recorrente para manter o desenho e acabamento.', features: ['Barbas ilimitadas', 'Barboterapia com desconto', 'Benefícios no Clube Gante'], recommended: false },
];

export default function PlansPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DashboardHeader eyebrow="Mais cuidado, menos preocupação" title="Planos Gante" description="Escolha a rotina que combina com você. Todos os valores são mensais e você acompanha tudo pela sua conta." />

        <section className="mt-9 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex flex-col rounded-[28px] border p-6 sm:p-7 ${plan.recommended ? 'border-[#174c35] bg-[#173b2b] text-white shadow-[0_24px_60px_rgba(23,59,43,.18)] lg:-translate-y-3' : 'border-[#d9d1c4] bg-[#fbf9f4]'}`}>
              {plan.recommended && <span className="absolute -top-3 left-6 inline-flex h-7 items-center gap-1.5 rounded-full bg-[#e0c174] px-3 text-[10px] font-bold uppercase tracking-wide text-[#173b2b]"><Crown className="size-3" /> Mais escolhido</span>}
              <span className={`grid size-12 place-items-center rounded-full ${plan.recommended ? 'bg-white/10 text-[#e0c174]' : 'bg-[#e6eee8] text-[#1c5b40]'}`}><Scissors className="size-5" /></span>
              <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em]">{plan.name}</h2>
              <p className={`mt-2 min-h-12 text-sm leading-6 ${plan.recommended ? 'text-white/60' : 'text-[#70746e]'}`}>{plan.description}</p>
              <p className="mt-7 flex items-end gap-1"><span className="mb-1 text-sm">R$</span><span className={`font-serif text-5xl tracking-[-0.04em] ${plan.recommended ? 'text-[#f0d28c]' : 'text-[#174c35]'}`}>{plan.price}</span><span className={`mb-1 text-sm ${plan.recommended ? 'text-white/55' : 'text-[#747870]'}`}>/mês</span></p>
              <ul className={`mt-7 space-y-3 border-t pt-6 ${plan.recommended ? 'border-white/10' : 'border-[#e5ded3]'}`}>
                {plan.features.map((feature) => <li key={feature} className="flex items-center gap-3 text-sm"><span className={`grid size-5 place-items-center rounded-full ${plan.recommended ? 'bg-white/10 text-[#e0c174]' : 'bg-[#e4eee7] text-[#1a5a3d]'}`}><Check className="size-3" strokeWidth={3} /></span>{feature}</li>)}
              </ul>
              <Link href="/agendar" className={`mt-8 inline-flex h-12 items-center justify-center rounded-full text-sm font-bold ${plan.recommended ? 'bg-[#e0c174] text-[#173b2b] hover:bg-[#efcf83]' : 'bg-[#174c35] text-white hover:bg-[#103a28]'}`}>Agendar e conhecer</Link>
            </article>
          ))}
        </section>

        <section className="mt-8 flex flex-col gap-4 rounded-[24px] border border-[#d8d0c3] bg-[#fbf9f4] p-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-3"><Info className="mt-0.5 size-5 shrink-0 text-[#92743b]" /><span><strong className="block">Quer entender todos os detalhes?</strong><span className="mt-1 block text-sm text-[#70746e]">Consulte regras de uso, disponibilidade e condições de cada plano.</span></span></span>
          <Link href="/termos#planos" className="shrink-0 text-sm font-bold text-[#18563b] hover:underline">Ver termos dos planos</Link>
        </section>

        <div className="mt-8 rounded-[28px] bg-[#e9dfc4] p-7 text-center sm:p-10">
          <Sparkles className="mx-auto size-6 text-[#8b6c2d]" />
          <h2 className="mt-4 font-serif text-3xl">Ainda em dúvida?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#655e4f]">Você pode continuar agendando normalmente e conhecer os planos no momento mais conveniente.</p>
        </div>
      </div>
    </AppShell>
  );
}
