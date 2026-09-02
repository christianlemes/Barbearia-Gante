import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { FirebaseAuthProvider } from '@/components/firebase-auth-provider';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Gante Barbearia — Seu estilo, seu momento',
  description:
    'Agende seu corte ou barba na Gante. Atendimento preciso, ambiente contemporâneo e uma experiência feita para o seu estilo.',
  icons: {
    icon: '/gante-symbol.png',
    apple: '/gante-symbol.png',
  },
  openGraph: {
    title: 'Gante Barbearia — Seu estilo, seu momento',
    description: 'Atendimento preciso, ambiente contemporâneo e uma experiência feita para o seu estilo.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'Gante Barbearia — Seu estilo. Seu momento.' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gante Barbearia — Seu estilo, seu momento',
    description: 'Agende seu próximo corte ou barba na Gante.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} antialiased`}><FirebaseAuthProvider>{children}</FirebaseAuthProvider></body>
    </html>
  );
}
