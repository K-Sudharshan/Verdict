'use client';

import React, { useState } from 'react';
import { Claim, Evidence, ClaimStatus } from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel } from '@/lib/utils/display-labels';
import { ExternalLink } from 'lucide-react';

interface ClaimRiskMatrixProps {
  claims: Claim[];
  evidenceList: Evidence[];
  onSelectEvidence: (ev: Evidence) => void;
}

export const ClaimRiskMatrix: React.FC<ClaimRiskMatrixProps> = ({
  claims,
  evidenceList,
  onSelectEvidence
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | 'ALL'>('ALL');

  const filteredClaims = activeStatusFilter === 'ALL'
    ? claims
    : claims.filter(c => c.status === activeStatusFilter);

  const getStatusStampClass = (status: ClaimStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'border-zinc-400 text-zinc-200';
      case 'WELL_SUPPORTED':
        return 'border-zinc-500 text-zinc-300';
      case 'PARTIALLY_SUPPORTED':
        return 'border-zinc-700 text-zinc-400';
      case 'UNVERIFIED':
        return 'border-zinc-800 text-zinc-500';
      case 'CONTRADICTED':
        return 'border-zinc-600 text-zinc-300 font-bold';
      default:
        return 'border-zinc-800 text-zinc-500';
    }
  };

  return (
    <div className="space-y-0 animate-in fade-in duration-300">
      {/* ── HEADER & FILTER ── */}
      <div className="pb-8 border-b border-zinc-900">
        <p className="case-label mb-2">evidence verification audit</p>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h2 className="font-display text-white" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Claim Risk &amp; Verification Matrix
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Deterministic corroboration status of candidate assertions against primary documents.
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 text-xs font-mono shrink-0">
            {['ALL', 'VERIFIED', 'WELL_SUPPORTED', 'PARTIALLY_SUPPORTED', 'UNVERIFIED', 'CONTRADICTED'].map(statusKey => (
              <button
                key={statusKey}
                onClick={() => setActiveStatusFilter(statusKey)}
                className={`text-[11px] pb-0.5 border-b transition-colors ${
                  activeStatusFilter === statusKey
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-zinc-600 hover:text-zinc-300'
                }`}
              >
                {statusKey === 'ALL' ? 'ALL CLAIMS' : statusKey.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CLAIMS TABLE ── */}
      <div className="dossier-section">
        <div className="flex items-baseline justify-between mb-4">
          <p className="case-label">audited candidate claims</p>
          <span className="text-[10px] font-mono text-zinc-600">
            Showing {filteredClaims.length} of {claims.length} claims
          </span>
        </div>

        <div className="space-y-0">
          {filteredClaims.map((claim, idx) => (
            <div key={claim.id} className="dossier-entry">
              {/* Left Column: Number & Category */}
              <div className="w-20 shrink-0 pt-0.5">
                <span className="block font-mono text-[11px] text-zinc-600">
                  #{String(idx + 1).padStart(2, '0')}
                </span>
                <span className="case-label mt-1 block">
                  {claim.category}
                </span>
              </div>

              {/* Middle Column: Claim & Citations */}
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                  {claim.claim_text}
                </p>

                {evidenceList.filter(e => e.claim_id === claim.id).length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-900">
                    <span className="text-[10px] text-zinc-600 font-mono">Primary Source:</span>
                    {evidenceList.filter(e => e.claim_id === claim.id).map(ev => {
                      const label = getEvidenceDisplayLabel(ev, { short: true });
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => onSelectEvidence(ev)}
                          className="inline-flex items-center gap-1 text-[10px] font-sans text-zinc-500 hover:text-white underline underline-offset-2 transition-colors"
                        >
                          {label} <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Status Stamp */}
              <div className="shrink-0 self-start pt-0.5">
                <span className={`stamp ${getStatusStampClass(claim.status)}`}>
                  {claim.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
