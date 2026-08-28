'use client';

import React from 'react';
import Link from 'next/link';
import VerdictExperience from '@/components/experience/verdict-experience';
import { Scale, Lock, ArrowRight, FileText, Code, HeartHandshake, Briefcase, ShieldAlert, Play, Swords } from 'lucide-react';

const DEMO_CASES = [
  {
    href: '/session/eval_alex_rivera',
    index: '01',
    tag: 'Primary Showcase',
    name: 'Alex Rivera',
    role: 'Lead Distributed Systems Engineer',
    stack: 'Go · Kafka · Raft · PostgreSQL',
    verdict: 'HIRE',
    summary: 'Demonstrates Mind-Change Detection: Technical Agent initially recommended STRONG_HIRE, but conceded lack of baseline telemetry when challenged by Skeptic on a 40% latency claim, revising stance to calibrated HIRE.',
    stats: '6 evidence quotes · 2 debate turns',
  },
  {
    href: '/session/eval_jordan_chen',
    index: '02',
    tag: 'Deep Tech Case',
    name: 'Dr. Jordan Chen',
    role: 'Staff ML Platform Architect',
    stack: 'CUDA · PyTorch · NeurIPS · C++',
    verdict: 'INTERVIEW',
    summary: 'Demonstrates Qualitative Non-Averaged Deliberation: High technical research pedigree (6 papers) balanced against zero on-call production SLA history, yielding targeted interview verification questions.',
    stats: '3 extracted claims · 1 conflict resolved',
  },
];

const AGENTS = [
  { code: 'TECH', title: 'Technical Depth Analyst', focus: 'Code fluency, system design, architectural complexity, hands-on deliverables. Rejects buzzwords without implementation proof.', icon: Code },
  { code: 'HR', title: 'HR & Culture Analyst', focus: 'Collaboration, mentorship, communication quality, career continuity. Strictly avoids protected-attribute biases.', icon: HeartHandshake },
  { code: 'MGR', title: 'Hiring Manager', focus: 'Immediate business delivery, ramp-up time, role alignment, hiring upside vs. onboarding overhead.', icon: Briefcase },
  { code: 'SKPT', title: 'Skeptic / Red Team', focus: 'Adversarially probes for metric inflation, timeline gaps, and unverifiable assertions. Surfaces verification risks.', icon: ShieldAlert },
];

const GUARANTEES = [
  { code: '§ 1', title: 'Stage 1 Isolation', body: 'All 4 initial evaluations run via isolated parallel calls. No agent receives another agent\'s conclusions before debate begins.' },
  { code: '§ 2', title: 'Bounded Debate Engine', body: 'Disagreements are targeted directly with evidence citations. Position changes are preserved immutably in revision logs.' },
  { code: '§ 3', title: 'Non-Averaged Synthesis', body: 'Final recommendations weigh documentary evidence and debate concessions — not an arithmetic mean across agents.' },
];

export default function HomePage() {
  return (
    <VerdictExperience>
      <div className="max-w-4xl mx-auto py-10 space-y-0">

        {/* ── PAGE TITLE ── */}
        <div className="pb-8 border-b border-zinc-900">
          <p className="case-label mb-2">deliberative intelligence engine</p>
          <h1 className="font-display text-white" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(2.6rem, 6vw, 4rem)' }}>
            Multi-Agent<br />Hiring Deliberation
          </h1>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl font-sans">
            Four independent expert personas reason privately over verbatim candidate evidence, challenge each other in structured cross-examinations, and synthesize defensible hiring verdicts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/session/eval_alex_rivera" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-sans font-semibold text-black bg-white hover:bg-zinc-100 transition-colors">
              <Play className="w-3.5 h-3.5 fill-black" />
              View Live Demo
            </Link>
            <Link href="/evaluate" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-sans font-semibold text-white border border-zinc-700 hover:border-zinc-500 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              New Evaluation
            </Link>
          </div>
        </div>

        {/* ── CASE FILES ── */}
        <div className="dossier-section">
          <p className="case-label mb-6">pre-loaded case files</p>
          <div className="space-y-0">
            {DEMO_CASES.map(c => (
              <Link key={c.href} href={c.href} className="group dossier-entry block hover:bg-zinc-950 transition-colors px-0 -mx-2 px-2">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] text-zinc-600 w-6 shrink-0">{c.index}</span>
                    <div>
                      <h2 className="font-display text-xl text-white group-hover:text-zinc-200" style={{ fontFamily: 'Abril Fatface, serif' }}>
                        {c.name}
                      </h2>
                      <p className="text-xs text-zinc-500 font-sans mt-0.5">{c.role} — {c.stack}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="stamp">{c.verdict}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed ml-10">{c.summary}</p>
                <p className="text-[10px] text-zinc-600 font-mono mt-2 ml-10 tracking-wide">{c.stats}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── EXPERT PERSONAS ── */}
        <div className="dossier-section">
          <p className="case-label mb-6">expert evaluation panel</p>
          <div className="space-y-0">
            {AGENTS.map(a => (
              <div key={a.code} className="dossier-entry">
                <span className="agent-monogram">{a.code}</span>
                <div className="flex-1">
                  <p className="text-sm font-sans font-semibold text-white">{a.title}</p>
                  <p className="text-xs text-zinc-500 font-sans mt-1 leading-relaxed">{a.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PIPELINE GUARANTEES ── */}
        <div className="dossier-section">
          <p className="case-label mb-6">deterministic pipeline guarantees</p>
          <div className="space-y-0">
            {GUARANTEES.map(g => (
              <div key={g.code} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-10 shrink-0 pt-0.5">{g.code}</span>
                <div className="flex-1">
                  <p className="text-sm font-sans font-medium text-zinc-200">{g.title}</p>
                  <p className="text-xs text-zinc-500 font-sans mt-1 leading-relaxed">{g.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </VerdictExperience>
  );
}
