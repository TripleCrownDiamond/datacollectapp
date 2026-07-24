import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TerraCollect',
  description: 'Offline-first data collection platform with AI and GIS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
