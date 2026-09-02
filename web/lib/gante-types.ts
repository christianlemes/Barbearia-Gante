export type AppointmentStatus = 'confirmed' | 'completed' | 'canceled' | 'no_show';

export type AppointmentRecord = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: string;
  service_name: string;
  professional_id: string;
  professional_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  price_cents: number;
  unit_name: string;
  unit_address: string;
  status: AppointmentStatus;
  slot_id: string;
  cancel_reason: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceRecord = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  popular: boolean;
  active: boolean;
  sort_order: number;
};

export type ProfessionalRecord = {
  id: string;
  name: string;
  initials: string;
  role: string;
  rating: string | null;
  active: boolean;
  sort_order: number;
};

export type CustomerProfile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  birth: string;
  zip: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  reminders: boolean;
  created_at: string;
  updated_at: string;
};

export const defaultServices: ServiceRecord[] = [
  { id: 'corte', name: 'Corte Gante', description: 'Corte personalizado e finalização', duration_minutes: 45, price_cents: 5000, popular: true, active: true, sort_order: 1 },
  { id: 'barba', name: 'Barba premium', description: 'Toalha quente, desenho e acabamento', duration_minutes: 40, price_cents: 4500, popular: false, active: true, sort_order: 2 },
  { id: 'combo', name: 'Corte + barba', description: 'Experiência completa Gante', duration_minutes: 75, price_cents: 9000, popular: true, active: true, sort_order: 3 },
  { id: 'barboterapia', name: 'Barboterapia', description: 'Cuidado profundo e relaxamento', duration_minutes: 50, price_cents: 5500, popular: false, active: true, sort_order: 4 },
  { id: 'pele', name: 'Limpeza de pele', description: 'Limpeza, esfoliação e hidratação', duration_minutes: 35, price_cents: 4000, popular: false, active: true, sort_order: 5 },
  { id: 'sobrancelha', name: 'Sobrancelha', description: 'Alinhamento natural', duration_minutes: 15, price_cents: 1500, popular: false, active: true, sort_order: 6 },
];

export const defaultProfessionals: ProfessionalRecord[] = [
  { id: 'biel', name: 'Biel', initials: 'BI', role: 'Cortes modernos e degradê', rating: '4,9', active: true, sort_order: 1 },
  { id: 'andre', name: 'André', initials: 'AN', role: 'Barba e visagismo', rating: '5,0', active: true, sort_order: 2 },
];
