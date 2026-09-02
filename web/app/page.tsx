import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Scissors,
  Sparkles,
  Star,
} from 'lucide-react';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { Badge } from '@/components/ui/badge';

const services = [
  { id: 'corte', name: 'Corte Gante', detail: '45 min', price: 'R$ 50' },
  { id: 'barba', name: 'Barba premium', detail: '40 min', price: 'R$ 45' },
  { id: 'combo', name: 'Corte + barba', detail: '1h 15', price: 'R$ 90' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f3efe6] text-[#17251f]">
      <section className="relative min-h-[760px] bg-[#102a20] text-[#f8f3e8]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_78%_28%,#2e5c46_0%,transparent_32%),linear-gradient(120deg,transparent_0%,transparent_58%,#081810_100%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-6 sm:px-8 lg:px-14">
          <Brand dark />

          <nav aria-label="Navegação principal" className="hidden items-center gap-8 text-sm text-[#d9d3c6] md:flex">
            <a className="transition-colors hover:text-white" href="#sobre">Sobre nós</a>
            <a className="transition-colors hover:text-white" href="#servicos">Serviços</a>
            <a className="transition-colors hover:text-white" href="#planos">Planos</a>
            <a className="transition-colors hover:text-white" href="#unidade">Unidade</a>
          </nav>

          <Link href="/agendamentos" className="inline-flex h-11 items-center justify-center rounded-full bg-[#e2bf70] px-5 text-sm font-semibold text-[#102a20] hover:bg-[#f0cf83]">Minha agenda</Link>
        </header>

        <div id="inicio" className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:px-14 lg:pb-28 lg:pt-20">
          <div className="max-w-3xl">
            <Badge className="mb-7 h-8 border border-[#e2bf70]/30 bg-[#e2bf70]/10 px-3 text-[#f0d28c]">
              <Sparkles className="size-3.5" /> Mais que um corte. Seu momento.
            </Badge>
            <h1 className="max-w-[780px] font-serif text-[clamp(3.3rem,7vw,7.3rem)] leading-[0.88] tracking-[-0.055em] text-[#fbf7ef]">
              Estilo que fala antes de você.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#cec8bb] sm:text-lg">
              Atendimento preciso, ambiente contemporâneo e profissionais que entendem o seu estilo. Escolha o serviço e encontre seu próximo horário.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/agendar" className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#e2bf70] px-7 text-base font-semibold text-[#102a20] hover:bg-[#f0cf83]">
                Agendar agora <ArrowRight className="size-4" />
              </Link>
              <a href="#sobre" className="inline-flex h-13 items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10">
                Conhecer a Gante
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-sm text-[#d8d2c6]">
              <span className="flex items-center gap-2"><Star className="size-4 fill-[#e2bf70] text-[#e2bf70]" /> 4,9 de avaliação</span>
              <span className="flex items-center gap-2"><MapPin className="size-4 text-[#e2bf70]" /> Parque Santos Dumont</span>
              <span className="flex items-center gap-2"><Clock3 className="size-4 text-[#e2bf70]" /> Ter–Sáb, 9h–20h</span>
            </div>
          </div>

          <aside aria-label="Comece seu agendamento" className="rounded-[32px] border border-white/10 bg-[#f8f4eb] p-3 text-[#17251f] shadow-[0_32px_90px_rgba(3,12,8,.36)] sm:p-5">
            <div className="rounded-[24px] border border-[#d9d1c1] bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7e715c]">Agendamento rápido</p>
                  <h2 className="mt-2 font-serif text-3xl tracking-[-0.025em]">O que vamos cuidar hoje?</h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e7efe9] text-[#184b36]"><Scissors className="size-5" /></span>
              </div>

              <div id="servicos" className="mt-7 space-y-2.5">
                {services.map((service, index) => (
                  <Link href={`/agendar?servico=${service.id}`} key={service.name} className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${index === 0 ? 'border-[#1c5b40] bg-[#edf4ef]' : 'border-[#e2ddd2] hover:border-[#9caf9f] hover:bg-[#faf8f3]'}`}>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${index === 0 ? 'border-[#1c5b40] bg-[#1c5b40] text-white' : 'border-[#b6b0a5]'}`}>
                      {index === 0 && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{service.name}</span>
                      <span className="mt-0.5 block text-xs text-[#786f62]">{service.detail}</span>
                    </span>
                    <span className="font-semibold">{service.price}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e2ddd2] bg-[#faf8f3] p-4 text-left">
                  <CalendarDays className="mb-2 size-4 text-[#1c5b40]" />
                  <span className="block text-xs text-[#786f62]">Data</span>
                  <span className="mt-0.5 block text-sm font-semibold">Primeiro horário</span>
                </div>
                <div className="rounded-2xl border border-[#e2ddd2] bg-[#faf8f3] p-4 text-left">
                  <MapPin className="mb-2 size-4 text-[#1c5b40]" />
                  <span className="block text-xs text-[#786f62]">Unidade</span>
                  <span className="mt-0.5 block truncate text-sm font-semibold">Santos Dumont</span>
                </div>
              </div>

              <Link href="/agendar" className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#184b36] text-base font-semibold text-white hover:bg-[#0f3928]">
                Ver horários disponíveis <ArrowRight className="size-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-[#7d7468]">Você confirma seus dados somente no final.</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="sobre" className="border-b border-[#d8d0c2] bg-[#fbf8f1] px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
        <div className="mx-auto grid max-w-[1328px] gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#816b3d]">Sobre nós</p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.04em] sm:text-6xl">Uma barbearia feita para respeitar quem você é.</h2>
          </div>
          <div className="lg:pt-2">
            <p className="text-lg leading-8 text-[#505950]">A Gante nasceu com uma ideia simples: transformar o cuidado pessoal em um momento de confiança, conversa e atenção verdadeira. Aqui, cada corte começa ouvindo você e termina com um resultado que combina com sua rotina e sua identidade.</p>
            <p className="mt-5 leading-7 text-[#6b716a]">Nossa unidade no Parque Santos Dumont reúne técnica, ambiente contemporâneo e atendimento próximo. Não trabalhamos com soluções iguais para todo mundo — cada detalhe é pensado para valorizar o seu estilo.</p>
            <div className="mt-9 grid grid-cols-3 gap-3 border-t border-[#dcd4c7] pt-7">
              {[
                ['4,9', 'avaliação média'],
                ['2', 'especialistas'],
                ['6', 'serviços essenciais'],
              ].map(([value, label]) => <div key={label}><strong className="block font-serif text-3xl text-[#174c35] sm:text-4xl">{value}</strong><span className="mt-1 block text-xs leading-5 text-[#747970]">{label}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="experiencia" className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:px-14 lg:py-28">
        <figure className="relative min-h-[330px] overflow-hidden rounded-[32px] border border-[#d1c8b8] shadow-[0_26px_80px_rgba(23,59,43,.12)] sm:min-h-[520px] lg:col-span-2">
          <img src="/gante-hero.png" alt="Barbeiro da Gante finalizando o desenho de uma barba" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d241a]/65 via-transparent to-transparent" />
          <figcaption className="absolute bottom-6 left-6 max-w-sm text-white sm:bottom-10 sm:left-10">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#e6c77f]">Precisão Gante</span>
            <span className="mt-2 block font-serif text-3xl leading-tight sm:text-5xl">Técnica, atenção e um resultado que é só seu.</span>
          </figcaption>
        </figure>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#816b3d]">A experiência Gante</p>
          <h2 className="mt-4 max-w-lg font-serif text-4xl leading-[1.02] tracking-[-0.035em] sm:text-6xl">Cuidado em cada detalhe, sem complicar sua rotina.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['01', 'Escolha simples', 'Serviços, preços e duração claros desde o início.'],
            ['02', 'Seu profissional', 'Veja especialidades e encontre a melhor disponibilidade.'],
            ['03', 'Confirmação rápida', 'Receba tudo no celular e gerencie seu horário quando quiser.'],
          ].map(([number, title, text]) => (
            <article key={number} className="rounded-[24px] border border-[#d7cfbf] bg-[#fbf8f1] p-6">
              <span className="font-serif text-3xl text-[#a98b4f]">{number}</span>
              <h3 className="mt-8 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#675f54]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="planos" className="bg-[#e9dfc4] px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
        <div className="mx-auto max-w-[1328px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#816b3d]">Planos Gante</p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.02] tracking-[-0.035em] sm:text-6xl">Seu cuidado sempre em dia.</h2></div>
            <Link href="/planos" className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-full bg-[#174c35] px-6 text-sm font-bold text-white hover:bg-[#103a28] sm:self-auto">Comparar planos <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              ['Corte em dia', 'R$ 89,99', 'Cortes ilimitados e prioridade para agendar.'],
              ['Experiência completa', 'R$ 179,99', 'Cabelo, barba e todos os benefícios do Clube.'],
              ['Barba impecável', 'R$ 139,99', 'Cuidado recorrente e acabamento sempre preciso.'],
            ].map(([name, price, text], index) => <article key={name} className={`rounded-[26px] border p-6 ${index === 1 ? 'border-[#174c35] bg-[#173b2b] text-white shadow-xl' : 'border-[#d0c4a5] bg-[#f7f1e2]'}`}><span className={`text-xs font-bold uppercase tracking-[0.14em] ${index === 1 ? 'text-[#e0c174]' : 'text-[#816b3d]'}`}>{index === 1 ? 'Mais escolhido' : 'Assinatura mensal'}</span><h3 className="mt-5 font-serif text-3xl">{name}</h3><p className={`mt-2 text-sm leading-6 ${index === 1 ? 'text-white/60' : 'text-[#6d6654]'}`}>{text}</p><p className={`mt-8 font-serif text-3xl ${index === 1 ? 'text-[#f0d28c]' : 'text-[#174c35]'}`}>{price}<span className="ml-1 text-xs font-sans">/mês</span></p></article>)}
          </div>
        </div>
      </section>

      <section id="unidade" className="px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
        <div className="mx-auto grid max-w-[1328px] gap-6 rounded-[32px] bg-[#173b2b] p-6 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0c174]">Nossa unidade</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">Parque Santos Dumont</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Rua Senador Filinto Müller, 145. Um espaço pensado para você desacelerar, cuidar do visual e sair renovado.</p><div className="mt-6 flex flex-wrap gap-5 text-sm text-white/80"><span className="flex items-center gap-2"><MapPin className="size-4 text-[#e0c174]" /> São José dos Campos</span><span className="flex items-center gap-2"><Clock3 className="size-4 text-[#e0c174]" /> Ter–Sáb, 9h–20h</span></div></div>
          <Link href="/agendar" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#e0c174] px-6 text-sm font-bold text-[#173b2b] hover:bg-[#efcf83]">Agendar nesta unidade <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-[#d5cdbf] px-5 py-10 sm:px-8 lg:px-14">
        <div className="mx-auto flex max-w-[1328px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Brand /><p className="text-xs text-[#777b75]">© 2026 Gante Barbearia. Seu estilo, seu momento.</p><div className="flex gap-5 text-xs font-semibold text-[#60655f]"><a href="#sobre">Sobre nós</a><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link><Link href="/agendamentos">Minha agenda</Link></div></div>
      </footer>
    </main>
  );
}
