'use client';

import React from 'react';
import { FinalDecision, Evidence, Claim, ConflictRecord } from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel, sanitizeUserFacingText } from '@/lib/utils/display-labels';
import { CounterfactualExplorer } from './CounterfactualExplorer';
import { ExternalLink } from 'lucide-react';

interface FinalDecisionDossierProps {
  decision: FinalDecision | null;
  evidenceList: Evidence[];
  claims: Claim[];
  conflicts: ConflictRecord[];
  onSelectEvidence: (ev: Evidence) => void;
}

export const FinalDecisionDossier: React.FC<FinalDecisionDossierProps> = ({
  decision, evidenceList, claims, conflicts, onSelectEvidence
}) => {
  if (!decision) {
    return (
      <div className="py-12 text-center border-t border-zinc-900">
        <p className="text-xs text-zinc-600 font-sans">Final deliberation pending — waiting for debate synthesis.</p>
      </div>
    );
  }

  const confidencePercent = Math.round((decision.confidence_score || 0.85) * 100);

  return (
    <div className="space-y-0 animate-in fade-in duration-300">

      {/* ── RULING HEADER ── */}
      <div className="pb-8 border-b border-zinc-900">
        <p className="case-label mb-3">final deliberation · non-averaged synthesis</p>
        <div className="flex items-start justify-between gap-6">
          <h2 className="font-display text-white" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Consensus Verdict &amp;<br />Hiring Recommendation
          </h2>
          <div className="shrink-0 text-right">
            <span className="stamp-white text-sm px-2.5 py-1">
              {decision.recommendation.replace(/_/g, ' ')}
            </span>
            <p className="text-[10px] text-zinc-600 font-mono mt-2">{decision.confidence_level} · {confidencePercent}%</p>
            <p className="text-[10px] text-zinc-700 font-mono">{decision.model_name || 'gemini-2.0-flash'}</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 font-sans mt-4 italic">
          Confidence reflects consistency and documentary sufficiency — not an algorithmic score average.
        </p>
      </div>

      {/* ── RATIONALE ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">synthesis rationale</p>
        <div className="text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
          {sanitizeUserFacingText(decision.reasoning)}
        </div>
      </div>

      {/* ── STRENGTHS ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">verified strengths</p>
        <div className="space-y-0">
          {decision.strengths.map((s, idx) => (
            <div key={idx} className="dossier-entry">
              <span className="font-mono text-[11px] text-zinc-600 w-6 shrink-0 pt-0.5">S{idx + 1}</span>
              <div className="flex-1">
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">{s.statement}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-[10px] text-zinc-600 font-sans">
                    {s.supportingAgents.map(a => a.replace(/_/g, ' ')).join(' · ')}
                  </span>
                  {s.evidenceIds && s.evidenceIds.length > 0 && (
                    <div className="flex gap-2">
                      {s.evidenceIds.map(evId => {
                        const ev = evidenceList.find(e => e.id === evId);
                        const label = getEvidenceDisplayLabel(ev, { short: true });
                        return (
                          <button key={evId} type="button" onClick={() => ev && onSelectEvidence(ev)}
                            className="inline-flex items-center gap-1 text-[10px] font-sans text-zinc-500 hover:text-white underline underline-offset-2 transition-colors">
                            {label} <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONCERNS ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">major concerns &amp; audit items</p>
        <div className="space-y-0">
          {decision.concerns.map((c, idx) => (
            <div key={idx} className="dossier-entry">
              <div className="w-6 shrink-0 pt-0.5">
                <span className="font-mono text-[11px] text-zinc-600">C{idx + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="stamp">{c.severity}</span>
                  <span className="text-[10px] text-zinc-600 font-sans">Raised by {c.raisingAgent.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">{c.statement}</p>
                {c.evidenceIds && c.evidenceIds.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {c.evidenceIds.map(evId => {
                      const ev = evidenceList.find(e => e.id === evId);
                      const label = getEvidenceDisplayLabel(ev, { short: true });
                      return (
                        <button key={evId} type="button" onClick={() => ev && onSelectEvidence(ev)}
                          className="inline-flex items-center gap-1 text-[10px] font-sans text-zinc-500 hover:text-white underline underline-offset-2 transition-colors">
                          {label} <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VERIFICATION QUESTIONS ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">targeted interview verification questions</p>
        <p className="text-[10px] text-zinc-600 font-sans mb-4">Derived from weak claims &amp; unresolved debate points</p>
        <div className="space-y-0">
          {decision.verification_questions.map((vq, idx) => (
            <div key={idx} className="dossier-entry">
              <span className="font-mono text-[11px] text-zinc-600 w-6 shrink-0 pt-0.5">V{idx + 1}</span>
              <div className="flex-1">
                <p className="text-xs text-zinc-200 font-sans font-medium leading-relaxed">&ldquo;{vq.question}&rdquo;</p>
                {vq.intent && (
                  <p className="text-[11px] text-zinc-500 font-sans italic mt-1">{vq.intent}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COUNTERFACTUAL ── */}
      <div className="dossier-section">
        <CounterfactualExplorer />
      </div>

    </div>
  );
};
