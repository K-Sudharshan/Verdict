'use client';

import React from 'react';
import { FinalDecision, Evidence, Claim, AgentRun } from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel, getClaimDisplayLabel } from '@/lib/utils/display-labels';
import { ExternalLink } from 'lucide-react';

interface EvidenceProvenanceGraphProps {
  decision: FinalDecision | null;
  evidenceList: Evidence[];
  claims: Claim[];
  agentRuns: AgentRun[];
  onSelectEvidence: (ev: Evidence) => void;
}

export const EvidenceProvenanceGraph: React.FC<EvidenceProvenanceGraphProps> = ({
  decision,
  evidenceList,
  claims,
  onSelectEvidence
}) => {
  if (!decision) return null;

  return (
    <div className="space-y-0 animate-in fade-in duration-300">
      {/* ── HEADER ── */}
      <div className="pb-8 border-b border-zinc-900">
        <p className="case-label mb-2">chain of custody &amp; auditability</p>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h2 className="font-display text-white" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Evidence Provenance &amp; Verification Trail
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Deterministic backward trace connecting the consensus verdict to verified verbatim document quotes.
            </p>
          </div>
          <span className="stamp shrink-0">100% Traceability</span>
        </div>
      </div>

      {/* ── ROOT RULING ── */}
      <div className="dossier-section">
        <p className="case-label mb-2">verdict root node</p>
        <div className="flex items-baseline justify-between py-3 border-t border-zinc-900">
          <div>
            <span className="font-display text-xl text-white" style={{ fontFamily: 'Abril Fatface, serif' }}>
              {decision.recommendation.replace(/_/g, ' ')}
            </span>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Confidence: {decision.confidence_level} · Synthesis Model: {decision.model_name || 'gemini-2.0-flash'}
            </p>
          </div>
          <span className="stamp-white">{decision.confidence_level}</span>
        </div>
      </div>

      {/* ── STRENGTHS CHAINS ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">supporting evidentiary chains</p>
        <div className="space-y-0">
          {decision.strengths.map((s, idx) => {
            const ev = evidenceList.find(e => s.evidenceIds.includes(e.id));
            const claim = claims.find(c => c.id === ev?.claim_id);
            const claimLabel = getClaimDisplayLabel(claim);
            const evidenceLabel = getEvidenceDisplayLabel(ev);

            return (
              <div key={idx} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-12 shrink-0 pt-0.5">
                  CHAIN #{idx + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs text-zinc-200 font-sans font-medium leading-relaxed">
                    {s.statement}
                  </p>

                  <div className="pl-4 border-l border-zinc-800 space-y-1.5 text-xs font-sans">
                    {claim && (
                      <p className="text-zinc-400">
                        <span className="case-label">Grounding Claim:</span> {claimLabel} — &ldquo;{claim.claim_text}&rdquo;
                      </p>
                    )}
                    {ev && (
                      <div className="flex items-center gap-2">
                        <span className="case-label">Verbatim Evidence:</span>
                        <button
                          type="button"
                          onClick={() => onSelectEvidence(ev)}
                          className="font-mono text-[11px] text-zinc-300 hover:text-white underline flex items-center gap-1"
                        >
                          {evidenceLabel} <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
