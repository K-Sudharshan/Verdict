import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Verdict AI — Multi-Agent Evidence-Based Hiring Debate System',
  description: 'An evidence-first multi-agent AI hiring intelligence platform featuring independent persona evaluations, structured cross-examination, and qualitative final deliberation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-white selection:text-black">
        <Header />

        <main className="flex-1 relative max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-10 py-10">
          {children}
        </main>

        <footer className="relative border-t border-zinc-900 bg-black py-8 text-center text-xs text-zinc-600">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-medium text-zinc-400">Verdict AI — Multi-Agent Evidence-Based Decision System</span>
            <span className="font-mono text-[11px] text-zinc-600">Independent Analysis • Adversarial Debate • Traceable Verdict</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
