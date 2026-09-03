'use client';

import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { getFirebaseDb } from '@/lib/firebase-client';
import {
  defaultProfessionals,
  defaultServices,
  type AppointmentRecord,
  type AppointmentStatus,
  type CustomerProfile,
  type ProfessionalRecord,
  type ServiceRecord,
} from '@/lib/gante-types';

const UNIT_NAME = 'Parque Santos Dumont';
const UNIT_ADDRESS = 'Rua Senador Filinto Müller, 145';

function fromDocument<T extends { id: string }>(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

function slotId(date: string, professionalId: string, time: string) {
  return `${date}_${professionalId}_${time.replace(':', '')}`;
}

export function friendlyFirebaseError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/email-already-in-use': 'Este e-mail já possui uma conta.',
    'auth/weak-password': 'Use uma senha mais forte, com pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
    'auth/popup-closed-by-user': 'O login com Google foi fechado antes de terminar.',
    'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Libere pop-ups e tente novamente.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
    'permission-denied': 'Você não tem permissão para realizar esta ação.',
    'firestore/permission-denied': 'Você não tem permissão para realizar esta ação.',
    'unavailable': 'O serviço está temporariamente indisponível. Tente novamente.',
    'firestore/unavailable': 'O serviço está temporariamente indisponível. Tente novamente.',
  };
  if (code && messages[code]) return messages[code];
  return error instanceof Error ? error.message : 'Não foi possível concluir a ação.';
}

export async function ensureUserProfile(user: User, values?: Partial<CustomerProfile>) {
  const now = new Date().toISOString();
  const reference = doc(getFirebaseDb(), 'users', user.uid);
  const current = await getDoc(reference);
  await setDoc(
    reference,
    {
      uid: user.uid,
      name: values?.name ?? user.displayName ?? current.data()?.name ?? '',
      email: user.email ?? current.data()?.email ?? '',
      phone: values?.phone ?? current.data()?.phone ?? '',
      birth: values?.birth ?? current.data()?.birth ?? '',
      zip: values?.zip ?? current.data()?.zip ?? '',
      street: values?.street ?? current.data()?.street ?? '',
      number: values?.number ?? current.data()?.number ?? '',
      complement: values?.complement ?? current.data()?.complement ?? '',
      district: values?.district ?? current.data()?.district ?? '',
      city: values?.city ?? current.data()?.city ?? '',
      state: values?.state ?? current.data()?.state ?? '',
      reminders: values?.reminders ?? current.data()?.reminders ?? true,
      created_at: current.data()?.created_at ?? now,
      updated_at: now,
    } satisfies CustomerProfile,
    { merge: true },
  );
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'users', uid));
  return snapshot.exists() ? ({ uid: snapshot.id, ...snapshot.data() } as CustomerProfile) : null;
}

export async function saveUserProfile(uid: string, values: Partial<CustomerProfile>) {
  await setDoc(doc(getFirebaseDb(), 'users', uid), { ...values, uid, updated_at: new Date().toISOString() }, { merge: true });
}

export function subscribeServices(callback: (items: ServiceRecord[]) => void, includeInactive = false): Unsubscribe {
  const request = query(collection(getFirebaseDb(), 'services'), orderBy('sort_order'));
  return onSnapshot(request, (snapshot) => {
    const stored = snapshot.docs.map((item) => fromDocument<ServiceRecord>(item));
    const items = stored.length ? stored : defaultServices;
    callback(includeInactive ? items : items.filter((item) => item.active));
  });
}

export function subscribeProfessionals(callback: (items: ProfessionalRecord[]) => void, includeInactive = false): Unsubscribe {
  const request = query(collection(getFirebaseDb(), 'professionals'), orderBy('sort_order'));
  return onSnapshot(request, (snapshot) => {
    const stored = snapshot.docs.map((item) => fromDocument<ProfessionalRecord>(item));
    const items = stored.length ? stored : defaultProfessionals;
    callback(includeInactive ? items : items.filter((item) => item.active));
  });
}

export async function seedCatalog() {
  const db = getFirebaseDb();
  const [serviceSnapshot, professionalSnapshot] = await Promise.all([
    getDocs(collection(db, 'services')),
    getDocs(collection(db, 'professionals')),
  ]);
  const batch = writeBatch(db);
  if (serviceSnapshot.empty) defaultServices.forEach((item) => batch.set(doc(db, 'services', item.id), item));
  if (professionalSnapshot.empty) defaultProfessionals.forEach((item) => batch.set(doc(db, 'professionals', item.id), item));
  if (!serviceSnapshot.empty && !professionalSnapshot.empty) return;
  await batch.commit();
}

export async function createBooking(input: {
  user: User;
  customerName: string;
  customerPhone: string;
  service: ServiceRecord;
  professionalId: string;
  professionals: ProfessionalRecord[];
  appointmentDate: string;
  appointmentTime: string;
}) {
  const db = getFirebaseDb();
  const appointmentReference = doc(collection(db, 'appointments'));
  const availableProfessionals = input.professionalId === 'any'
    ? input.professionals.filter((item) => item.active)
    : input.professionals.filter((item) => item.id === input.professionalId && item.active);
  if (!availableProfessionals.length) throw new Error('Nenhum profissional está disponível para esta seleção.');

  return runTransaction(db, async (transaction) => {
    let selected: ProfessionalRecord | null = null;
    let selectedSlotId = '';

    for (const professional of availableProfessionals) {
      const candidateSlotId = slotId(input.appointmentDate, professional.id, input.appointmentTime);
      const candidate = await transaction.get(doc(db, 'booking_slots', candidateSlotId));
      if (!candidate.exists()) {
        selected = professional;
        selectedSlotId = candidateSlotId;
        break;
      }
    }

    if (!selected) throw new Error('Este horário acabou de ser reservado. Escolha outro horário.');

    const now = new Date().toISOString();
    const appointment: AppointmentRecord = {
      id: appointmentReference.id,
      customer_id: input.user.uid,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      customer_email: input.user.email ?? '',
      service_id: input.service.id,
      service_name: input.service.name,
      professional_id: selected.id,
      professional_name: selected.name,
      appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime,
      duration_minutes: input.service.duration_minutes,
      price_cents: input.service.price_cents,
      unit_name: UNIT_NAME,
      unit_address: UNIT_ADDRESS,
      status: 'confirmed',
      slot_id: selectedSlotId,
      cancel_reason: null,
      canceled_at: null,
      created_at: now,
      updated_at: now,
    };

    transaction.set(appointmentReference, appointment);
    transaction.set(doc(db, 'booking_slots', selectedSlotId), {
      appointment_id: appointmentReference.id,
      appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime,
      professional_id: selected.id,
      created_at: now,
    });
    return appointment;
  });
}

export function subscribeCustomerAppointments(uid: string, callback: (items: AppointmentRecord[]) => void, onError?: (error: Error) => void) {
  const request = query(collection(getFirebaseDb(), 'appointments'), where('customer_id', '==', uid));
  return onSnapshot(
    request,
    (snapshot) => callback(snapshot.docs.map((item) => fromDocument<AppointmentRecord>(item))),
    (error) => onError?.(error),
  );
}

export function subscribeAllAppointments(callback: (items: AppointmentRecord[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(getFirebaseDb(), 'appointments'),
    (snapshot) => callback(snapshot.docs.map((item) => fromDocument<AppointmentRecord>(item))),
    (error) => onError?.(error),
  );
}

export function subscribeOccupiedSlots(appointmentDate: string, callback: (slotIds: Set<string>) => void, onError?: (error: Error) => void) {
  const request = query(collection(getFirebaseDb(), 'booking_slots'), where('appointment_date', '==', appointmentDate));
  return onSnapshot(
    request,
    (snapshot) => callback(new Set(snapshot.docs.map((item) => item.id))),
    (error) => onError?.(error),
  );
}

export async function cancelBooking(appointmentId: string, customerId: string, reason = 'Cancelado pelo cliente') {
  const db = getFirebaseDb();
  const reference = doc(db, 'appointments', appointmentId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Agendamento não encontrado.');
    const appointment = { id: snapshot.id, ...snapshot.data() } as AppointmentRecord;
    if (appointment.customer_id !== customerId) throw new Error('Você não pode cancelar este agendamento.');
    if (appointment.status !== 'confirmed') throw new Error('Este agendamento já foi finalizado.');

    const now = new Date().toISOString();
    const updated: AppointmentRecord = { ...appointment, status: 'canceled', cancel_reason: reason, canceled_at: now, updated_at: now };
    transaction.update(reference, { status: 'canceled', cancel_reason: reason, canceled_at: now, updated_at: now });
    if (appointment.slot_id) transaction.delete(doc(db, 'booking_slots', appointment.slot_id));
    return updated;
  });
}

export async function changeAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  const db = getFirebaseDb();
  const reference = doc(db, 'appointments', appointmentId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Agendamento não encontrado.');
    const appointment = { id: snapshot.id, ...snapshot.data() } as AppointmentRecord;
    const now = new Date().toISOString();

    if (status === 'confirmed' && appointment.status === 'canceled') {
      const slotReference = doc(db, 'booking_slots', appointment.slot_id);
      const slot = await transaction.get(slotReference);
      if (slot.exists()) throw new Error('O horário já está ocupado e não pode ser reativado.');
      transaction.set(slotReference, {
        appointment_id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        professional_id: appointment.professional_id,
        created_at: now,
      });
    }

    if (status === 'canceled' && appointment.slot_id) {
      transaction.delete(doc(db, 'booking_slots', appointment.slot_id));
    }

    const changes = {
      status,
      cancel_reason: status === 'canceled' ? 'Cancelado pela administração' : null,
      canceled_at: status === 'canceled' ? now : null,
      updated_at: now,
    };
    transaction.update(reference, changes);
    return { ...appointment, ...changes } as AppointmentRecord;
  });
}

export async function updateCatalogActive(kind: 'service' | 'professional', id: string, active: boolean) {
  await updateDoc(doc(getFirebaseDb(), kind === 'service' ? 'services' : 'professionals', id), { active });
}
