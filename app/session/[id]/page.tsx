'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { EvaluationFullAggregate, Evidence } from '@/lib/validation/schemas';
import { PipelineStepper } from '@/components/layout/PipelineStepper';
import { CandidateProfileView } from '@/components/profile/CandidateProfileView';
import { AgentCard } from '@/components/agents/AgentCard';
import { AgentIndependenceBanner } from '@/components/agents/AgentIndependenceBanner';
import { DebateRoom } from '@/components/debate/DebateRoom';
import { ClaimRiskMatrix } from '@/components/risk-map/ClaimRiskMatrix';
import { FinalDecisionDossier } from '@/components/dossier/FinalDecisionDossier';
import { EvidenceProvenanceGraph } from '@/components/evidence/EvidenceProvenanceGraph';
import { EvidenceLedgerModal } from '@/components/evidence/EvidenceLedgerModal';
import { ArrowLeft, Printer } from 'lucide-react';

type WorkspaceTab = 'DOSSIER' | 'AGENTS' | 'DEBATE' | 'RISK_MAP' | 'PROFILE' | 'PROVENANCE';

export default function SessionWorkspacePage() {
  const params = useParams();
  const evaluationId = params.id as string;

  const [evaluation, setEvaluation] = useState<EvaluationFullAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('DOSSIER');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  // Decision Replay State
  const [replayStep, setReplayStep] = useState<number>(5);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        const res = await fetch(`/api/evaluations/${evaluationId}`);
        const data = await res.json();
        if (data.success && data.evaluation) {
          setEvaluation(data.evaluation);
        }
      } catch (e) {
        console.error('Failed to load evaluation session:', e);
      } finally {
        setLoading(false);
      }
    }
    if (evaluationId) {
      loadEvaluation();
    }
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400 space-y-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-sans">Loading deliberation case file...</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-12 text-center text-zinc-400 space-y-4 bg-black border border-zinc-800">
        <h2 className="text-xl font-bold text-white font-sans">Evaluation Session Not Found</h2>
        <p className="text-xs text-zinc-400">The requested evaluation ID does not exist in the database.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-black">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const tabs: { id: WorkspaceTab; label: string; code: string; badge?: string }[] = [
    { id: 'DOSSIER', label: 'Decision Dossier', code: '01', badge: evaluation.final_decision?.recommendation.replace(/_/g, ' ') },
    { id: 'AGENTS', label: '4 Independent Analyses', code: '02', badge: 'Round 1' },
    { id: 'DEBATE', label: 'Cross-Examination', code: '03', badge: `${evaluation.debate_messages.length} turns` },
    { id: 'RISK_MAP', label: 'Claim Risk Matrix', code: '04', badge: `${evaluation.claims.length} claims` },
    { id: 'PROFILE', label: 'Candidate Profile', code: '05' },
    { id: 'PROVENANCE', label: 'Evidence Provenance', code: '06', badge: '100%' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-0 pb-16 animate-in fade-in duration-300">
      {/* ── CASE-FILE DOCKET HEADER ── */}
      <div className="pb-8 border-b border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="text-zinc-600 hover:text-white transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
              </Link>
              <span className="case-label">CASE DOCKET · {evaluation.id}</span>
              {evaluation.evaluation_mode === 'REAL' ? (
                <span className="stamp-white">REAL LLM</span>
              ) : (
                <span className="stamp">DEMO / MOCK</span>
              )}
            </div>

            <h1 className="font-display text-white" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
              {evaluation.candidate_name}
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Target Role: <span className="text-zinc-200">{evaluation.role_title || 'Candidate Evaluation'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/report/${evaluation.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Formal Ruling Report
            </Link>
          </div>
        </div>
      </div>

      {/* ── PIPELINE BREADCRUMB ── */}
      <PipelineStepper status={evaluation.status} />

      {/* ── DECISION REPLAY TIMELINE ── */}
      <div className="dossier-section flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 text-xs">
        <span className="case-label">DECISION REPLAY TIMELINE:</span>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {[
            { step: 1, label: '01 Ingestion', tab: 'PROFILE' as WorkspaceTab },
            { step: 2, label: '02 Profile', tab: 'PROFILE' as WorkspaceTab },
            { step: 3, label: '03 Isolated Agents', tab: 'AGENTS' as WorkspaceTab },
            { step: 4, label: '04 Cross-Exam', tab: 'DEBATE' as WorkspaceTab },
            { step: 5, label: '05 Deliberation', tab: 'DOSSIER' as WorkspaceTab }
          ].map(s => (
            <button
              key={s.step}
              onClick={() => {
                setReplayStep(s.step);
                setActiveTab(s.tab);
              }}
              className={`pb-0.5 border-b transition-colors ${
                replayStep === s.step
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── WORKSPACE TABS ── */}
      <div className="flex items-center gap-6 overflow-x-auto pb-2 border-b border-zinc-900 mb-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-baseline gap-2 py-2 text-xs font-sans whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="font-mono text-[10px] text-zinc-600">{tab.code}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="stamp text-[9px] px-1 py-0">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div>
        {activeTab === 'DOSSIER' && (
          <FinalDecisionDossier
            decision={evaluation.final_decision}
            evidenceList={evaluation.evidence}
            claims={evaluation.claims}
            conflicts={evaluation.conflicts}
            onSelectEvidence={(ev) => setSelectedEvidence(ev)}
          />
        )}

        {activeTab === 'AGENTS' && (
          <div className="space-y-0 animate-in fade-in duration-300">
            <AgentIndependenceBanner />
            <div className="space-y-0">
              {evaluation.agent_runs.map((run) => (
                <AgentCard
                  key={run.id}
                  run={run}
                  evidenceList={evaluation.evidence}
                  onSelectEvidence={(ev) => setSelectedEvidence(ev)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DEBATE' && (
          <DebateRoom
            debateSession={evaluation.debate_session}
            conflicts={evaluation.conflicts}
            debateMessages={evaluation.debate_messages}
            revisions={evaluation.revisions}
            agentRuns={evaluation.agent_runs}
            evidenceList={evaluation.evidence}
            onSelectEvidence={(ev) => setSelectedEvidence(ev)}
          />
        )}

        {activeTab === 'RISK_MAP' && (
          <ClaimRiskMatrix
            claims={evaluation.claims}
            evidenceList={evaluation.evidence}
            onSelectEvidence={(ev) => setSelectedEvidence(ev)}
          />
        )}

        {activeTab === 'PROFILE' && (
          <CandidateProfileView
            profile={evaluation.profile}
            claims={evaluation.claims}
            evidence={evaluation.evidence}
            onSelectEvidence={(ev) => setSelectedEvidence(ev)}
          />
        )}

        {activeTab === 'PROVENANCE' && (
          <EvidenceProvenanceGraph
            decision={evaluation.final_decision}
            evidenceList={evaluation.evidence}
            claims={evaluation.claims}
            agentRuns={evaluation.agent_runs}
            onSelectEvidence={(ev) => setSelectedEvidence(ev)}
          />
        )}
      </div>

      {/* Interactive Evidence Inspection Modal */}
      <EvidenceLedgerModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}
