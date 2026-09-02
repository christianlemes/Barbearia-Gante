import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Brand } from '@/components/brand';

export function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#17251f]">
      <header className="border-b border-[#d9d2c6] bg-[#fbf9f4]"><div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-5 sm:px-8"><Brand /><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#18563b]"><ArrowLeft className="size-4" /> Voltar ao site</Link></div></header>
      <article className="mx-auto max-w-[860px] px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#92743b]">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#646961]">{intro}</p>
        <div className="mt-12 max-w-none space-y-8 text-[15px] leading-7 text-[#555b55] [&_a]:font-semibold [&_a]:text-[#18563b] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:tracking-[-0.025em] [&_h2]:text-[#173b2b] [&_li]:my-2 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:max-w-3xl [&_strong]:text-[#273c31] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">{children}</div>
      </article>
    </main>
  );
}
