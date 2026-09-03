'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, BadgePercent, Check, Coffee, Copy, Dumbbell, HeartPulse, Search, Sparkles, TicketCheck, X } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { DashboardHeader } from '@/components/dashboard-header';
import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { Input } from '@/components/ui/input';

const benefits = [
  { id: 'grao-prosa', icon: Coffee, partner: 'Grão & Prosa', category: 'Gastronomia', offer: '15% de desconto', detail: 'Em cafés, brunch e confeitaria', color: 'bg-[#e9dfc9] text-[#775b2c]' },
  { id: 'north-gym', icon: Dumbbell, partner: 'North Gym', category: 'Esportes', offer: '1ª mensalidade grátis', detail: 'Plano anual para novos alunos', color: 'bg-[#dce8df] text-[#1c5b3f]' },
  { id: 'viva-estetica', icon: HeartPulse, partner: 'Viva Estética', category: 'Saúde / Estética', offer: '20% de desconto', detail: 'Em limpeza de pele e massagens', color: 'bg-[#eadfde] text-[#7d4641]' },
];

const filters = ['Todos', 'Gastronomia', 'Esportes', 'Saúde / Estética'];

export default function ClubPage() {
  const { user } = useFirebaseAuth();
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [copied, setCopied] = useState(false);

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return benefits.filter((item) => (filter === 'Todos' || item.category === filter) && (!term || `${item.partner} ${item.offer} ${item.detail}`.toLocaleLowerCase('pt-BR').includes(term)));
  }, [filter, search]);
  const selected = benefits.find((item) => item.id === selectedId);
  const coupon = selected ? `GANTE-${selected.id.replace(/[^a-z]/g, '').slice(0, 6).toUpperCase()}-${(user?.uid ?? 'CLIENTE').slice(0, 4).toUpperCase()}` : '';

  async function copyCoupon() {
    try {
      await navigator.clipboard.writeText(coupon);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <DashboardHeader eyebrow="Benefícios além da barbearia" title="Clube Gante" description="Vantagens selecionadas para fazer parte da sua rotina." action={<div className="flex h-11 items-center gap-2 rounded-full bg-[#efe5c9] px-4 text-sm font-bold text-[#6c5528]"><TicketCheck className="size-4" /> {benefits.length} benefícios disponíveis</div>} />

        <section className="mt-8 rounded-[28px] bg-[#173b2b] p-6 text-white sm:p-8"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e0c174]"><Sparkles className="size-4" /> Exclusivo para clientes Gante</p><h2 className="mt-3 max-w-xl font-serif text-3xl tracking-[-0.025em] sm:text-4xl">Seu estilo abre portas para novas experiências.</h2><p className="mt-3 text-sm text-white/60">Escolha um benefício, gere o cupom e apresente ao parceiro.</p></div><BadgePercent className="hidden size-20 text-white/10 md:block" /></div></section>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#82857f]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 rounded-full bg-[#fbf9f4] pl-11 pr-4" placeholder="Buscar parceiro ou benefício" /></div>
          <div className="flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button type="button" onClick={() => setFilter(item)} key={item} className={`h-10 shrink-0 rounded-full border px-4 text-xs font-bold ${filter === item ? 'border-[#174c35] bg-[#174c35] text-white' : 'border-[#d9d2c6] bg-[#fbf9f4] text-[#686d66] hover:border-[#9eaa9f]'}`}>{item}</button>)}</div>
        </div>

        {visible.length ? <section className="mt-6 grid gap-4 md:grid-cols-3">{visible.map((benefit) => { const Icon = benefit.icon; return <article key={benefit.partner} className="group flex min-h-[310px] flex-col rounded-[26px] border border-[#dbd3c6] bg-[#fbf9f4] p-6 transition-all hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><span className={`grid size-14 place-items-center rounded-2xl ${benefit.color}`}><Icon className="size-6" /></span><span className="rounded-full border border-[#ddd5c9] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#777b75]">{benefit.category}</span></div><p className="mt-6 text-sm font-bold text-[#696e67]">{benefit.partner}</p><h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.025em] text-[#173b2b]">{benefit.offer}</h2><p className="mt-3 text-sm leading-6 text-[#70746e]">{benefit.detail}</p><button type="button" onClick={() => { setSelectedId(benefit.id); setCopied(false); }} className="mt-auto flex items-center justify-between border-t border-[#e5dfd5] pt-5 text-sm font-bold text-[#18563b]">Gerar cupom <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button></article>; })}</section> : <section className="mt-6 rounded-[26px] border border-dashed border-[#d4ccbf] bg-[#fbf9f4] p-12 text-center"><Search className="mx-auto size-7 text-[#989b96]" /><h2 className="mt-4 font-serif text-2xl">Nenhum benefício encontrado</h2><p className="mt-2 text-sm text-[#70746e]">Tente outro nome ou categoria.</p></section>}
      </div>

      {selected && <dialog open aria-labelledby="coupon-title" className="fixed inset-0 z-[80] m-0 grid size-full max-h-none max-w-none place-items-center border-0 bg-[#08160f]/70 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-[28px] bg-[#fbf9f4] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-full bg-[#e4eee7] text-[#18563b]"><TicketCheck className="size-5" /></span><button type="button" onClick={() => setSelectedId('')} aria-label="Fechar cupom" className="grid size-10 place-items-center rounded-full hover:bg-[#eee9df]"><X className="size-5" /></button></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">Cupom Clube Gante</p><h2 id="coupon-title" className="mt-2 font-serif text-3xl">{selected.partner}</h2><p className="mt-2 text-sm text-[#70746e]">{selected.offer} · {selected.detail}</p><div className="mt-6 rounded-2xl border-2 border-dashed border-[#bda667] bg-[#f1e8cf] p-5 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#79642f]">Seu código</p><p className="mt-2 font-mono text-xl font-bold tracking-[0.08em] text-[#173b2b]">{coupon}</p></div><button type="button" onClick={() => void copyCoupon()} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174c35] text-sm font-bold text-white">{copied ? <><Check className="size-4" /> Código copiado</> : <><Copy className="size-4" /> Copiar cupom</>}</button><p className="mt-4 text-center text-xs leading-5 text-[#777b75]">Apresente este código ao parceiro. A disponibilidade e as condições são confirmadas no local.</p></section></dialog>}
    </AppShell>
  );
}
