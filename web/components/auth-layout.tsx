import Link from 'next/link';
import { ArrowLeft, CalendarDays, ShieldCheck } from 'lucide-react';

import { Brand } from '@/components/brand';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[#f3f0e9] lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,.95fr)]">
      <section className="relative hidden overflow-hidden bg-[#102a20] lg:block">
        <img src="/gante-hero.png" alt="Barbeiro da Gante realizando acabamento de barba" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,29,20,.8),rgba(9,29,20,.08)),linear-gradient(0deg,rgba(6,20,14,.7),transparent_50%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Brand dark />
          <div className="max-w-lg text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0c174]">Seu estilo, seu momento</p>
            <h2 className="mt-4 font-serif text-5xl leading-[.98] tracking-[-0.04em] xl:text-6xl">Seu próximo horário está a poucos passos.</h2>
            <div className="mt-8 flex gap-6 border-t border-white/15 pt-6 text-sm text-white/70"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-[#e0c174]" /> Agendamento simples</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#e0c174]" /> Dados protegidos</span></div>
          </div>
        </div>
      </section>
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end"><Brand className="lg:hidden" /><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#666b64] hover:text-[#174c35]"><ArrowLeft className="size-4" /> Voltar</Link></div>
        <div className="my-auto flex justify-center py-10">{children}</div>
        <p className="text-center text-[11px] text-[#8a8e87]">
          © 2026 Gante Barbearia ·{' '}
          <Link href="/privacidade" className="font-semibold hover:text-[#18563b] hover:underline">Privacidade</Link>
          {' '}·{' '}
          <Link href="/termos" className="font-semibold hover:text-[#18563b] hover:underline">Termos</Link>
        </p>
      </section>
    </main>
  );
}
