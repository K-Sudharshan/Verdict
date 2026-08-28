'use client';

import React from 'react';
import { Evidence } from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel } from '@/lib/utils/display-labels';
import { X } from 'lucide-react';

interface EvidenceLedgerModalProps {
  evidence: Evidence | null;
  onClose: () => void;
}

export const EvidenceLedgerModal: React.FC<EvidenceLedgerModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const displayLabel = getEvidenceDisplayLabel(evidence);
  const locationLabel = evidence.location?.document_name
    ? `${evidence.location.document_name}${evidence.location.page ? ` · Page ${evidence.location.page}` : ''}${evidence.location.section ? ` (${evidence.location.section})` : ''}`
    : `${evidence.location?.section ? `Section: ${evidence.location.section}` : 'Document Body'}${evidence.location?.page ? ` (Page ${evidence.location.page})` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-black border border-zinc-800 rounded shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="stamp">
                {displayLabel}
              </span>
              <span className="case-label">PRIMARY DOCUMENTARY RECORD</span>
            </div>
            <h3 className="font-display text-base text-white mt-1" style={{ fontFamily: 'Abril Fatface, serif' }}>
              Evidence Item Inspection
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs font-sans">
          {/* Quote Block */}
          <div>
            <p className="case-label mb-2">verbatim documentary citation</p>
            <div className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs leading-relaxed">
              &ldquo;{evidence.quote_text}&rdquo;
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
            <div>
              <p className="case-label mb-1">document type</p>
              <p className="text-zinc-300 font-mono">{evidence.document_type}</p>
            </div>

            <div>
              <p className="case-label mb-1">provenance location</p>
              <p className="text-zinc-300 font-mono truncate" title={locationLabel}>{locationLabel}</p>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4">
            <p className="case-label mb-1">evidentiary guarantee</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              All persona conclusions, debate challenges, and consensus recommendations are strictly bounded to verified document text.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-sans font-semibold text-black bg-white hover:bg-zinc-200 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
