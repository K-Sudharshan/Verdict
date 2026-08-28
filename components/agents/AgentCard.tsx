'use client';

import React from 'react';
import { AgentRun, Evidence } from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel } from '@/lib/utils/display-labels';
import { ExternalLink } from 'lucide-react';

interface AgentCardProps {
  run: AgentRun;
  evidenceList: Evidence[];
  onSelectEvidence: (ev: Evidence) => void;
}

const AGENT_META: Record<string, { code: string; title: string; focus: string }> = {
  TECHNICAL: { code: 'TECH', title: 'Technical Depth Analyst', focus: 'Code fluency · Architecture rigor' },
  HR_CULTURE: { code: 'HR', title: 'HR & Culture Analyst', focus: 'Teamwork · Ownership · Communication' },
  HIRING_MANAGER: { code: 'MGR', title: 'Hiring Manager', focus: 'Business impact · Time-to-productivity' },
  SKEPTIC: { code: 'SKPT', title: 'Skeptic / Red Team', focus: 'Adversarial evidence audit' },
};

export const AgentCard: React.FC<AgentCardProps> = ({ run, evidenceList, onSelectEvidence }) => {
  const op = run.output;
  const meta = AGENT_META[run.agent_type] || { code: '???', title: 'AI Agent', focus: 'Independent evaluator' };
  const confidenceScore = op ? Math.round((op.confidence.score || 0) * 100) : 0;

  if (!op) {
    return (
      <div className="dossier-entry animate-pulse">
        <span className="agent-monogram">—</span>
        <div className="flex-1 h-20 bg-zinc-950" />
      </div>
    );
  }

  return (
    <div className="dossier-entry">
      {/* Left: monogram */}
      <div className="w-10 shrink-0 pt-0.5">
        <span className="block text-[11px] font-sans tracking-[0.12em] uppercase font-bold text-zinc-300">{meta.code}</span>
        <span className="block text-[9px] font-mono text-zinc-600 mt-1">{confidenceScore}%</span>
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header row */}
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-sans font-semibold text-white">{meta.title}</p>
            <p className="text-[10px] text-zinc-600 font-sans mt-0.5">{meta.focus}</p>
          </div>
          <span className="stamp shrink-0">{op.recommendation.replace(/_/g, ' ')}</span>
        </div>

        {/* Confidence note */}
        <p className="text-[11px] text-zinc-500 font-sans italic">
          &ldquo;{op.confidence.reason}&rdquo;
        </p>

        {/* Findings */}
        <div className="space-y-0">
          <p className="case-label mb-2">independent findings</p>
          {op.findings.map((f, idx) => (
            <div key={idx} className="flex gap-3 py-2.5 border-t border-zinc-900">
              <span className={`stamp shrink-0 self-start mt-0.5 ${
                f.stance === 'STRENGTH' ? 'border-zinc-500 text-zinc-300' :
                f.stance === 'CONCERN' ? 'border-zinc-700 text-zinc-500' :
                'border-zinc-800 text-zinc-600'
              }`}>
                {f.stance}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">{f.statement}</p>
                {f.evidence_ids && f.evidence_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {f.evidence_ids.map(evId => {
                      const ev = evidenceList.find(e => e.id === evId);
                      const label = getEvidenceDisplayLabel(ev, { short: true });
                      return (
                        <button
                          key={evId}
                          type="button"
                          onClick={() => ev && onSelectEvidence(ev)}
                          className="inline-flex items-center gap-1 text-[10px] font-sans text-zinc-500 hover:text-white underline underline-offset-2 transition-colors"
                        >
                          {label} <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-zinc-700 shrink-0 self-start mt-0.5">{f.support_level.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>

        {/* Cross-exam questions */}
        {op.questions_for_debate && op.questions_for_debate.length > 0 && (
          <div className="pt-2 border-t border-zinc-900">
            <p className="case-label mb-2">cross-examination focus</p>
            <ul className="space-y-1">
              {op.questions_for_debate.map((q, i) => (
                <li key={i} className="flex gap-2 text-[11px] text-zinc-500 font-sans">
                  <span className="font-mono text-zinc-700 shrink-0">Q{i + 1}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-900">
          <p className="text-[10px] font-mono text-zinc-700">Stage 1 Isolation · {run.model_name || 'gemini-2.0-flash'}</p>
        </div>
      </div>
    </div>
  );
};
