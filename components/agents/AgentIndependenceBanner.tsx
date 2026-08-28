'use client';

import React from 'react';

export const AgentIndependenceBanner: React.FC = () => {
  return (
    <div className="py-3 px-4 border border-zinc-800 bg-black mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="stamp">PROVABLE ISOLATION</span>
          <span className="font-sans font-semibold text-white">
            Round 1 — Independent Analysis Guarantee
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Each of the 4 expert personas analyzed candidate evidence in strict isolation. No agent had visibility into another agent&apos;s findings, confidence scores, or recommendations prior to the structured debate.
        </p>
      </div>

      <span className="text-[10px] font-mono text-zinc-500 shrink-0 self-start sm:self-auto">
        4 Isolated Parallel Runs
      </span>
    </div>
  );
};
