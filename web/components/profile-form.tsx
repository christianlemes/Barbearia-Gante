'use client';

import { useEffect, useMemo, useState } from 'react';
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { AlertCircle, Bell, Check, Loader2, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';

import { useFirebaseAuth } from '@/components/firebase-auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getFirebaseAuth } from '@/lib/firebase-client';
import { friendlyFirebaseError, getUserProfile, saveUserProfile } from '@/lib/firebase-data';
import type { CustomerProfile } from '@/lib/gante-types';

const emptyProfile: CustomerProfile = {
  uid: '', name: '', email: '', phone: '', birth: '', zip: '', street: '', number: '', complement: '', district: '', city: '', state: '', reminders: true, created_at: '', updated_at: '',
};

function FormField({ label, id, value, onChange, type = 'text', placeholder, readOnly = false }: { label: string; id: keyof CustomerProfile; value: string; onChange: (id: keyof CustomerProfile, value: string) => void; type?: string; placeholder?: string; readOnly?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} value={value} onChange={(event) => onChange(id, event.target.value)} readOnly={readOnly} placeholder={placeholder} className={`h-12 rounded-xl px-4 ${readOnly ? 'bg-[#f0ede7] text-[#777b75]' : 'bg-white'}`} />
    </div>
  );
}

export function ProfileForm() {
  const { user } = useFirebaseAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user) return;
    void getUserProfile(user.uid)
      .then((stored) => setProfile(stored ?? { ...emptyProfile, uid: user.uid, name: user.displayName ?? '', email: user.email ?? '' }))
      .catch((nextError) => setError(friendlyFirebaseError(nextError)))
      .finally(() => setLoading(false));
  }, [user]);

  const initials = useMemo(() => (profile.name || user?.displayName || 'Gante').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(), [profile.name, user?.displayName]);

  function change(id: keyof CustomerProfile, value: string) {
    setSaved(false);
    setProfile((current) => ({ ...current, [id]: value }));
  }

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await Promise.all([
        saveUserProfile(user.uid, profile),
        profile.name !== user.displayName ? updateProfile(user, { displayName: profile.name.trim() }) : Promise.resolve(),
      ]);
      setSaved(true);
      setNotice('Perfil atualizado com sucesso.');
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    } finally {
      setSaving(false);
    }
  }

  async function sendReset() {
    if (!user?.email) return;
    setError('');
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), user.email);
      setNotice('Enviamos o link para alterar sua senha.');
    } catch (nextError) {
      setError(friendlyFirebaseError(nextError));
    }
  }

  if (loading) return <div className="mt-8 flex min-h-64 items-center justify-center rounded-[26px] border border-[#d9d2c6] bg-[#fbf9f4]"><Loader2 className="size-5 animate-spin text-[#18563b]" /><span className="ml-3 text-sm text-[#70746e]">Carregando perfil...</span></div>;

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {error && <p role="alert" className="flex gap-3 rounded-2xl bg-[#f5e5e1] px-5 py-4 text-sm font-semibold text-[#8d3f33]"><AlertCircle className="size-4 shrink-0" />{error}</p>}
      {notice && <output className="block rounded-2xl bg-[#e3eee6] px-5 py-4 text-sm font-semibold text-[#18563b]">{notice}</output>}

      <section className="rounded-[26px] border border-[#d9d2c6] bg-[#fbf9f4] p-5 sm:p-7">
        <div className="flex flex-col gap-5 border-b border-[#e3ddd2] pb-6 sm:flex-row sm:items-center">
          <span aria-hidden className="grid size-20 place-items-center rounded-full bg-[#dce9e0] text-xl font-bold text-[#18563b]">{initials}</span>
          <div><h2 className="font-serif text-2xl">Dados pessoais</h2><p className="mt-1 text-sm text-[#70746e]">Informações usadas em seus agendamentos e comunicações.</p></div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Nome completo" id="name" value={profile.name} onChange={change} />
          <FormField label="E-mail da conta" id="email" type="email" readOnly value={profile.email || user?.email || ''} onChange={change} />
          <FormField label="WhatsApp" id="phone" type="tel" value={profile.phone} onChange={change} placeholder="(11) 99999-9999" />
          <FormField label="Data de nascimento" id="birth" type="date" value={profile.birth} onChange={change} />
        </div>
      </section>

      <section className="rounded-[26px] border border-[#d9d2c6] bg-[#fbf9f4] p-5 sm:p-7">
        <div className="flex items-center gap-3 border-b border-[#e3ddd2] pb-5"><span className="grid size-10 place-items-center rounded-full bg-[#e6eee8] text-[#1a5a3d]"><MapPin className="size-4" /></span><div><h2 className="font-serif text-2xl">Endereço</h2><p className="mt-1 text-sm text-[#70746e]">Facilita rotas e recomendações de unidade.</p></div></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-6">
          <div className="sm:col-span-2"><FormField label="CEP" id="zip" value={profile.zip} onChange={change} placeholder="00000-000" /></div>
          <div className="sm:col-span-4"><FormField label="Rua" id="street" value={profile.street} onChange={change} placeholder="Nome da rua" /></div>
          <div className="sm:col-span-2"><FormField label="Número" id="number" value={profile.number} onChange={change} placeholder="123" /></div>
          <div className="sm:col-span-4"><FormField label="Complemento" id="complement" value={profile.complement} onChange={change} placeholder="Apartamento, bloco..." /></div>
          <div className="sm:col-span-3"><FormField label="Bairro" id="district" value={profile.district} onChange={change} /></div>
          <div className="sm:col-span-2"><FormField label="Cidade" id="city" value={profile.city} onChange={change} /></div>
          <div className="sm:col-span-1"><FormField label="UF" id="state" value={profile.state} onChange={change} /></div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <button onClick={() => void sendReset()} type="button" className="flex items-start gap-4 rounded-[22px] border border-[#d9d2c6] bg-[#fbf9f4] p-5 text-left hover:border-[#a9b5aa]"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e6eee8] text-[#1a5a3d]"><ShieldCheck className="size-4" /></span><span><strong className="block text-sm">Segurança da conta</strong><span className="mt-1 block text-xs leading-5 text-[#747871]">Receba um link seguro para alterar sua senha</span><span className="mt-3 block text-xs font-bold text-[#18563b]">Enviar link</span></span></button>
        <div className="flex items-start gap-4 rounded-[22px] border border-[#d9d2c6] bg-[#fbf9f4] p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e6eee8] text-[#1a5a3d]"><Bell className="size-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">Lembretes</strong><span className="mt-1 block text-xs leading-5 text-[#747871]">Salvar preferência de comunicações</span></span><Switch checked={profile.reminders} onCheckedChange={(value) => setProfile((current) => ({ ...current, reminders: value }))} aria-label="Ativar lembretes" /></div>
      </section>

      <div className="sticky bottom-[78px] z-20 flex items-center justify-between rounded-2xl border border-[#d3ccbf] bg-[#fffdf8]/95 p-3 shadow-[0_14px_40px_rgba(28,48,37,.12)] backdrop-blur lg:bottom-4">
        <span className="hidden items-center gap-2 px-2 text-sm text-[#6e726c] sm:flex"><LockKeyhole className="size-4" /> Seus dados ficam protegidos pela sua conta Firebase.</span>
        <Button disabled={saving} type="submit" className="ml-auto h-11 rounded-full bg-[#174c35] px-6 hover:bg-[#103a28]">{saving ? <><Loader2 className="size-4 animate-spin" /> Salvando</> : saved ? <><Check className="size-4" /> Alterações salvas</> : 'Salvar alterações'}</Button>
      </div>
    </form>
  );
}
