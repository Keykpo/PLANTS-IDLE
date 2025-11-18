import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Green Tycoon - Idle Plant Game',
  description: 'Un juego incremental de gestión de plantas. Cultiva, mejora y expande tu imperio botánico.',
  keywords: 'idle game, clicker, plants, incremental, strategy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
