'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import {
  CalendarDays,
  Building2,
  ChevronRight,
  Crown,
  Home,
  Layers3,
  Loader2,
  LogOut,
  Scissors,
  ShieldCheck,
  TicketPercent,
  UserRound,
} from 'lucide-react';

import { Brand } from '@/components/brand';
import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { firebaseAdminEmail, getFirebaseAuth } from '@/lib/firebase-client';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app', label: 'Início', icon: Home },
  { href: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { href: '/clube', label: 'Clube Gante', icon: TicketPercent },
  { href: '/planos', label: 'Planos', icon: Layers3 },
  { href: '/perfil', label: 'Perfil', icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, configured } = useFirebaseAuth();

  useEffect(() => {
    if (!loading && configured && !user) router.replace(`/entrar?returnTo=${encodeURIComponent(pathname)}`);
  }, [configured, loading, pathname, router, user]);

  if (loading || (configured && !user)) {
    return <main className="grid min-h-screen place-items-center bg-[#f3f0e9]"><div className="text-center"><Loader2 className="mx-auto size-7 animate-spin text-[#18563b]" /><p className="mt-3 text-sm text-[#70746e]">Carregando sua conta...</p></div></main>;
  }

  if (!configured) {
    return <main className="grid min-h-screen place-items-center bg-[#f3f0e9] px-5"><div className="max-w-md rounded-[28px] border border-[#d9d2c6] bg-[#fbf9f4] p-8 text-center"><Brand className="justify-center" /><h1 className="mt-8 font-serif text-3xl">Conexão em preparação</h1><p className="mt-3 text-sm leading-6 text-[#70746e]">O Firebase precisa ser conectado antes de acessar a área do cliente.</p><Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#174c35] px-5 text-sm font-bold text-white">Voltar ao site</Link></div></main>;
  }

  const name = user?.displayName || user?.email?.split('@')[0] || 'Cliente Gante';
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const isAdmin = Boolean(user?.email && firebaseAdminEmail && user.email.toLowerCase() === firebaseAdminEmail.toLowerCase());

  async function logout() {
    await signOut(getFirebaseAuth());
    router.replace('/');
  }

  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#17251f]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#ddd6c8] bg-[#fbf9f4] px-5 py-6 lg:flex">
        <Brand href="/" />

        <nav aria-label="Área do cliente" className="mt-12 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-[#e5eee8] text-[#174c35]'
                    : 'text-[#5e625d] hover:bg-[#f0ece4] hover:text-[#17251f]',
                )}
              >
                <Icon className={cn('size-[18px]', active ? 'text-[#1e6848]' : 'text-[#8b8f89]')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 space-y-1 border-t border-[#e3ddd2] pt-5">
          <Link href="/" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#6d716b] hover:bg-[#f0ece4] hover:text-[#174c35]"><Building2 className="size-[17px] text-[#92958f]" /> Conhecer a Gante</Link>
          {isAdmin && <Link href="/admin" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#6d716b] hover:bg-[#f0ece4] hover:text-[#174c35]"><ShieldCheck className="size-[17px] text-[#92958f]" /> Administração</Link>}
        </div>

        <div className="mt-auto">
          <Link
            href="/agendar"
            className="group block rounded-2xl bg-[#153f2e] p-4 text-white shadow-[0_14px_36px_rgba(21,63,46,.18)]"
          >
            <span className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-white/10">
                <Scissors className="size-4 text-[#e4c574]" />
              </span>
              <ChevronRight className="size-4 text-white/55 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="mt-4 block font-serif text-xl">Novo agendamento</span>
            <span className="mt-1 block text-xs leading-5 text-white/65">Escolha serviço, profissional e horário.</span>
          </Link>

          <div className="mt-5 flex items-center gap-3 border-t border-[#e3ddd2] pt-5">
            <span className="grid size-10 place-items-center rounded-full bg-[#dfe9e2] text-sm font-bold text-[#1b563c]">{initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{name}</span>
              <span className="block truncate text-xs text-[#7b7f79]">{isAdmin ? 'Administrador' : 'Cliente Gante'}</span>
            </span>
            <button type="button" onClick={() => void logout()} aria-label="Sair" className="text-[#92958f] hover:text-[#8e3a2d]">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ddd6c8] bg-[#fbf9f4]/95 px-4 backdrop-blur lg:hidden">
        <Brand href="/" compact />
        <Link href="/planos" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#efe5c9] px-3 text-xs font-bold text-[#6f5623]">
          <Crown className="size-3.5" /> Conhecer planos
        </Link>
      </header>

      <main className="min-h-screen pb-24 lg:ml-[248px] lg:pb-0">
        {children}
      </main>

      <nav aria-label="Navegação mobile" className="fixed inset-x-0 bottom-0 z-50 grid h-[72px] grid-cols-5 border-t border-[#d8d1c4] bg-[#fffdf8]/96 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {navItems.map((item, index) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-semibold',
                active ? 'text-[#18563b]' : 'text-[#7e817c]',
              )}
            >
              <span className={cn('grid size-8 place-items-center rounded-full', index === 1 && 'relative')}>
                <Icon className="size-[19px]" />
              </span>
              {index === 2 ? 'Clube' : item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
