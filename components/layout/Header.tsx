'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-black/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-14 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 border border-zinc-700 flex items-center justify-center text-white group-hover:border-zinc-500 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-base text-white" style={{ fontFamily: 'Abril Fatface, serif' }}>
              VERDICT AI
            </span>
            <span className="stamp hidden sm:inline-block">Multi-Agent</span>
          </div>
        </Link>

        {/* Nav Actions */}
        <div className="flex items-center gap-5">
          <Link href="/" className="hidden sm:inline text-xs font-sans text-zinc-500 hover:text-white transition-colors tracking-wide">
            Dashboard
          </Link>
          <Link
            href="/evaluate"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-sans font-semibold text-black bg-white hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Evaluation
          </Link>
        </div>
      </div>
    </header>
  );
};
