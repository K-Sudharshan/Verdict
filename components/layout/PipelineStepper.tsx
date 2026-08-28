'use client';

import React from 'react';
import { EvaluationStatus } from '@/lib/validation/schemas';

interface PipelineStepperProps {
  status: EvaluationStatus;
}

const STEPS = [
  { id: 'doc', code: '01', label: 'Document Ingestion', sub: 'Resume · Transcript',
    isActive: (s: EvaluationStatus) => s === 'DOCUMENTS_PENDING' || s === 'PROCESSING',
    isComplete: (s: EvaluationStatus) => s !== 'DOCUMENTS_PENDING' && s !== 'PROCESSING' && s !== 'FAILED' },
  { id: 'profile', code: '02', label: 'Profile & Evidence Ledger', sub: 'Claims · Verbatim quotes',
    isActive: (s: EvaluationStatus) => s === 'PROFILE_READY',
    isComplete: (s: EvaluationStatus) => !['DOCUMENTS_PENDING', 'PROCESSING', 'PROFILE_READY', 'FAILED'].includes(s) },
  { id: 'agents', code: '03', label: 'Isolated Agent Analysis', sub: '4 independent evaluations',
    isActive: (s: EvaluationStatus) => s === 'AGENTS_RUNNING',
    isComplete: (s: EvaluationStatus) => ['AGENTS_COMPLETE', 'DEBATE_IN_PROGRESS', 'DEBATE_COMPLETE', 'DELIBERATING', 'COMPLETE'].includes(s) },
  { id: 'debate', code: '04', label: 'Structured Cross-Examination', sub: 'Challenges · Revisions',
    isActive: (s: EvaluationStatus) => s === 'DEBATE_IN_PROGRESS',
    isComplete: (s: EvaluationStatus) => ['DEBATE_COMPLETE', 'DELIBERATING', 'COMPLETE'].includes(s) },
  { id: 'deliberation', code: '05', label: 'Final Deliberation', sub: 'Evidence-weighted verdict',
    isActive: (s: EvaluationStatus) => s === 'DELIBERATING',
    isComplete: (s: EvaluationStatus) => s === 'COMPLETE' },
];

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ status }) => {
  return (
    <div className="border-t border-b border-zinc-900 py-3 mb-6">
      <div className="flex items-stretch gap-0 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const active = step.isActive(status);
          const complete = step.isComplete(status);
          return (
            <div key={step.id} className={`flex items-center gap-3 px-4 first:pl-0 shrink-0 ${idx < STEPS.length - 1 ? 'border-r border-zinc-900' : ''}`}>
              <span className={`font-mono text-[11px] ${
                complete ? 'text-white line-through' : active ? 'text-white' : 'text-zinc-600'
              }`}>
                {complete ? '✓' : step.code}
              </span>
              <div className="hidden sm:block">
                <p className={`text-[11px] font-sans font-medium tracking-wide ${
                  active ? 'text-white' : complete ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {active ? step.label.toUpperCase() : step.label}
                </p>
                <p className="text-[10px] text-zinc-600 font-sans">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
