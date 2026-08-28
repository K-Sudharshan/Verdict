'use client';

import React, { useState } from 'react';
import { Recommendation, ConfidenceLevel } from '@/lib/validation/schemas';
import { Sliders, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ShieldX } from 'lucide-react';

export const CounterfactualExplorer: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('default');

  const scenarios: Record<string, {
    label: string;
    description: string;
    counterfactualRecommendation: Recommendation;
    counterfactualConfidence: ConfidenceLevel;
    rationaleDelta: string;
    impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }> = {
    default: {
      label: 'Baseline Evaluated State',
      description: 'Current evidence ledger with core Go/Kafka verified, and 40% latency metric unverified.',
      counterfactualRecommendation: 'HIRE',
      counterfactualConfidence: 'HIGH',
      rationaleDelta: 'Current baseline: Technical Agent conceded lack of baseline telemetry during debate, leading to calibrated HIRE recommendation.',
      impactLevel: 'LOW'
    },
    unverified_k8s_disqualifier: {
      label: 'If Target Role strictly required Kubernetes CKA Certification',
      description: 'The job description requires mandatory on-call multi-cluster Kubernetes production mastery.',
      counterfactualRecommendation: 'INTERVIEW_RECOMMENDED',
      counterfactualConfidence: 'MEDIUM',
      rationaleDelta: 'Because Kubernetes is only listed in skills with zero deployment evidence (flagged during Skeptic Risk Audit), the recommendation drops from HIRE to INTERVIEW_RECOMMENDED to force mandatory live cluster probing.',
      impactLevel: 'HIGH'
    },
    latency_metric_verified: {
      label: 'If 40% Latency Reduction had Datadog Telemetry Benchmark attached',
      description: 'Candidate uploaded a verifiable load-test report proving p99 drop from 180ms to 108ms at 50k RPS.',
      counterfactualRecommendation: 'STRONG_HIRE',
      counterfactualConfidence: 'HIGH',
      rationaleDelta: 'The Skeptic’s primary challenge (Performance Metric Topic) would be completely resolved with direct evidence. Technical Agent would maintain STRONG_HIRE without concession.',
      impactLevel: 'HIGH'
    },
    timeline_contradiction: {
      label: 'If Transcript conferral date contradicted full-time employment start',
      description: 'Transcript showed full-time on-campus residency overlapping with senior engineering role.',
      counterfactualRecommendation: 'HOLD',
      counterfactualConfidence: 'LOW',
      rationaleDelta: 'A high-severity timeline contradiction triggers a risk penalty capping the decision at HOLD, requiring HR background check verification before any interview.',
      impactLevel: 'HIGH'
    }
  };

  const current = scenarios[selectedScenario] || scenarios.default;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-elevated via-surface to-surface-elevated border border-indigo-500/30 shadow-xl space-y-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Counterfactual Decision Simulator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                WHAT-IF SENSITIVITY ANALYSIS
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Test how changes in evidence veracity or missing documentary artifacts would dynamically alter the final verdict.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
        {Object.entries(scenarios).map(([key, sc]) => (
          <button
            key={key}
            onClick={() => setSelectedScenario(key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === key
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                : 'bg-surface-elevated/40 border-surface-border text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            <div className="text-[11px] font-semibold mb-1 truncate">{sc.label}</div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              sc.counterfactualRecommendation === 'STRONG_HIRE' ? 'bg-emerald-500/20 text-emerald-300' :
              sc.counterfactualRecommendation === 'HIRE' ? 'bg-blue-500/20 text-blue-300' :
              sc.counterfactualRecommendation === 'INTERVIEW_RECOMMENDED' ? 'bg-amber-500/20 text-amber-300' :
              'bg-purple-500/20 text-purple-300'
            }`}>
              Verdict → {sc.counterfactualRecommendation.replace('_', ' ')}
            </span>
          </button>
        ))}
      </div>

      {/* Outcome Comparison Box */}
      <div className="p-4 rounded-xl bg-black/40 border border-surface-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/50 pb-2.5">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase">Simulated Scenario:</span>
            <div className="text-xs font-bold text-white">{current.label}</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Projected Verdict:</span>
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {current.counterfactualRecommendation.replace('_', ' ')}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          <strong className="text-indigo-300">Deliberation Delta: </strong>
          {current.rationaleDelta}
        </p>
      </div>
    </div>
  );
};
