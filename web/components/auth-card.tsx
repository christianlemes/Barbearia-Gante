'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { firebaseConfigured, getFirebaseAuth } from '@/lib/firebase-client';
import { ensureUserProfile, friendlyFirebaseError } from '@/lib/firebase-data';

function destination() {
  if (typeof window === 'undefined') return '/app';
  const value = new URLSearchParams(window.location.search).get('returnTo');
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/app';
}

export function AuthCard({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const login = mode === 'login';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseConfigured) return;
    setBusy('email');
    setError('');
    setNotice('');
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    try {
      if (login) {
        const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        await ensureUserProfile(result.user);
      } else {
        const name = String(data.get('name') ?? '').trim();
        const phone = String(data.get('phone') ?? '').trim();
        const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
        await updateProfile(result.user, { displayName: name });
        await ensureUserProfile(result.user, { name, phone });
      }
      router.replace(destination());
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setBusy('');
    }
  }

  async function continueWithGoogle() {
    if (!firebaseConfigured) return;
    setBusy('google');
    setError('');
    setNotice('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      await ensureUserProfile(result.user);
      router.replace(destination());
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setBusy('');
    }
  }

  async function resetPassword() {
    const input = document.querySelector<HTMLInputElement>('#auth-email');
    const email = input?.value.trim();
    setError('');
    setNotice('');
    if (!email) {
      setError('Digite seu e-mail para receber o link de recuperação.');
      input?.focus();
      return;
    }
    setBusy('reset');
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      setNotice('Se o e-mail estiver cadastrado, você receberá o link de recuperação.');
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#92743b]">{login ? 'Que bom ter você de volta' : 'Sua experiência começa aqui'}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-[-0.035em] text-[#173b2b] sm:text-5xl">{login ? 'Entre na sua conta' : 'Crie sua conta'}</h1>
      <p className="mt-3 text-sm leading-6 text-[#6d716b]">{login ? 'Acompanhe horários, benefícios e seu plano em qualquer dispositivo.' : 'Sua conta guarda agenda, histórico e preferências com segurança.'}</p>

      {!firebaseConfigured && <p role="alert" className="mt-6 flex gap-3 rounded-2xl bg-[#f4e8d0] px-4 py-3 text-sm text-[#755c27]"><AlertCircle className="mt-0.5 size-4 shrink-0" /> A conexão com o Firebase ainda precisa ser ativada pelo responsável do projeto.</p>}
      {error && <p role="alert" className="mt-6 flex gap-3 rounded-2xl bg-[#f5e5e1] px-4 py-3 text-sm font-semibold text-[#8d3f33]"><AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}</p>}
      {notice && <p role="status" className="mt-6 flex gap-3 rounded-2xl bg-[#e3eee6] px-4 py-3 text-sm font-semibold text-[#18563b]"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {notice}</p>}

      <form onSubmit={submit} className="mt-8 space-y-5">
        {!login && (
          <div className="space-y-2">
            <Label htmlFor="auth-name">Nome completo</Label>
            <div className="relative"><UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8a8e87]" /><Input id="auth-name" name="name" required autoComplete="name" className="h-12 rounded-xl bg-white pl-11 pr-4" placeholder="Seu nome" /></div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="auth-email">E-mail</Label>
          <div className="relative"><Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8a8e87]" /><Input id="auth-email" name="email" type="email" required autoComplete="email" className="h-12 rounded-xl bg-white pl-11 pr-4" placeholder="voce@email.com" /></div>
        </div>
        {!login && (
          <div className="space-y-2">
            <Label htmlFor="auth-phone">WhatsApp</Label>
            <div className="relative"><Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8a8e87]" /><Input id="auth-phone" name="phone" type="tel" required autoComplete="tel" className="h-12 rounded-xl bg-white pl-11 pr-4" placeholder="(11) 99999-9999" /></div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label htmlFor="auth-password">Senha</Label>{login && <button disabled={busy === 'reset'} type="button" onClick={() => void resetPassword()} className="text-xs font-semibold text-[#18563b] hover:underline disabled:opacity-50">Esqueci minha senha</button>}</div>
          <div className="relative"><LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8a8e87]" /><Input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete={login ? 'current-password' : 'new-password'} minLength={6} className="h-12 rounded-xl bg-white pl-11 pr-12" placeholder="Mínimo de 6 caracteres" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#858983] hover:text-[#174c35]">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
        </div>

        {!login && <label className="flex items-start gap-3 text-xs leading-5 text-[#666b64]"><input required type="checkbox" className="mt-1 size-4 accent-[#174c35]" /><span>Concordo com os <Link href="/termos" className="font-semibold text-[#18563b] hover:underline">Termos de uso</Link> e a <Link href="/privacidade" className="font-semibold text-[#18563b] hover:underline">Política de privacidade</Link>.</span></label>}

        <Button disabled={!firebaseConfigured || Boolean(busy)} type="submit" className="h-12 w-full rounded-full bg-[#174c35] text-sm font-bold hover:bg-[#103a28]">{busy === 'email' ? <Loader2 className="size-4 animate-spin" /> : <>{login ? 'Entrar' : 'Criar minha conta'} <ArrowRight className="size-4" /></>}</Button>
      </form>

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#ddd6ca]" /><span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b8f88]">ou continue com</span><span className="h-px flex-1 bg-[#ddd6ca]" /></div>
      <button disabled={!firebaseConfigured || Boolean(busy)} type="button" onClick={() => void continueWithGoogle()} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#d3ccbf] bg-white text-sm font-semibold hover:bg-[#f4f0e8] disabled:opacity-50">{busy === 'google' ? <Loader2 className="size-4 animate-spin" /> : <><span className="font-bold text-[#4285f4]">G</span> Continuar com Google</>}</button>

      <p className="mt-7 text-center text-sm text-[#70746e]">{login ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'} <Link href={login ? '/cadastro' : '/entrar'} className="font-bold text-[#18563b] hover:underline">{login ? 'Cadastre-se' : 'Entrar'}</Link></p>
    </div>
  );
}
