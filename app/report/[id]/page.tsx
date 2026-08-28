'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { EvaluationFullAggregate, Evidence } from '@/lib/validation/schemas';
import { EvidenceLedgerModal } from '@/components/evidence/EvidenceLedgerModal';
import { sanitizeUserFacingText, getEvidenceDisplayLabel } from '@/lib/utils/display-labels';
import { Printer, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ShareableReportPage() {
  const params = useParams();
  const evaluationId = params.id as string;

  const [evaluation, setEvaluation] = useState<EvaluationFullAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/evaluations/${evaluationId}`);
        const data = await res.json();
        if (data.success && data.evaluation) {
          setEvaluation(data.evaluation);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (evaluationId) load();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs font-sans">
        Loading formal ruling report...
      </div>
    );
  }

  if (!evaluation || !evaluation.final_decision) {
    return (
      <div className="py-16 text-center text-zinc-500 text-xs font-sans">
        Ruling report not available for this evaluation.
      </div>
    );
  }

  const dec = evaluation.final_decision;
  const prof = evaluation.profile?.profile_data;

  return (
    <div className="max-w-4xl mx-auto space-y-0 py-8 text-zinc-100 print:bg-white print:text-black animate-in fade-in">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex items-center justify-between print:hidden pb-6 border-b border-zinc-900 mb-8">
        <Link
          href={`/session/${evaluation.id}`}
          className="flex items-center gap-1.5 text-xs font-sans text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deliberation Workspace
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold text-black bg-white hover:bg-zinc-200 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Formal Ruling
        </button>
      </div>

      {/* ── FORMAL RULING DOCKET ── */}
      <div className="space-y-0">
        {/* Header */}
        <div className="pb-8 border-b border-zinc-900">
          <p className="case-label mb-2">formal ruling &amp; hiring recommendation</p>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <h1 className="font-display text-white print:text-black" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(2.4rem, 5vw, 3.5rem)' }}>
                {evaluation.candidate_name}
              </h1>
              <p className="text-xs text-zinc-400 print:text-zinc-600 font-sans mt-1">
                Target Role: <strong className="text-zinc-200 print:text-black">{evaluation.role_title}</strong> · Docket ID: {evaluation.id}
              </p>
              {prof && (
                <p className="text-xs text-zinc-500 font-sans mt-0.5">
                  Degree: {prof.education.degree} · {prof.education.institution} {prof.education.gpa ? `(GPA: ${prof.education.gpa})` : ''}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <span className="stamp-white text-sm px-3 py-1">
                {dec.recommendation.replace(/_/g, ' ')}
              </span>
              <p className="text-[10px] text-zinc-500 font-mono mt-2">Confidence: {dec.confidence_level}</p>
            </div>
          </div>
        </div>

        {/* Synthesis Rationale */}
        <div className="dossier-section">
          <p className="case-label mb-4">comprehensive synthesis rationale</p>
          <div className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
            {sanitizeUserFacingText(dec.reasoning)}
          </div>
        </div>

        {/* Strengths */}
        <div className="dossier-section">
          <p className="case-label mb-4">verified key strengths ({dec.strengths.length})</p>
          <div className="space-y-0">
            {dec.strengths.map((s, idx) => (
              <div key={idx} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-8 shrink-0 pt-0.5">S{idx + 1}</span>
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-zinc-200 font-sans leading-relaxed">{s.statement}</p>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Supported by: {s.supportingAgents.map(a => a.replace(/_/g, ' ')).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concerns */}
        <div className="dossier-section">
          <p className="case-label mb-4">major concerns &amp; risk factors ({dec.concerns.length})</p>
          <div className="space-y-0">
            {dec.concerns.map((c, idx) => (
              <div key={idx} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-8 shrink-0 pt-0.5">C{idx + 1}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="stamp">{c.severity}</span>
                    <span className="text-[10px] text-zinc-500 font-sans">Raised by {c.raisingAgent.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-zinc-200 font-sans leading-relaxed">{c.statement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Questions */}
        <div className="dossier-section">
          <p className="case-label mb-4">recommended interview verification questions ({dec.verification_questions.length})</p>
          <div className="space-y-0">
            {dec.verification_questions.map((vq, idx) => (
              <div key={idx} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-8 shrink-0 pt-0.5">Q{idx + 1}</span>
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-zinc-200 font-sans font-medium leading-relaxed">&ldquo;{vq.question}&rdquo;</p>
                  {vq.intent && (
                    <p className="text-[11px] text-zinc-500 font-sans italic">{vq.intent}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off */}
        <div className="dossier-section flex items-baseline justify-between text-[10px] font-mono text-zinc-600 pt-6">
          <span>Verdict AI Deliberation System · Immutably Bound to Evidence</span>
          <span>Generated: {new Date(evaluation.created_at).toISOString().slice(0, 10)}</span>
        </div>
      </div>

      {/* Evidence modal if clicked */}
      <EvidenceLedgerModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}
