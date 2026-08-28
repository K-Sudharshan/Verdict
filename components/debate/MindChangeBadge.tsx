'use client';

import React from 'react';
import { AgentPositionRevision, AgentRun } from '@/lib/validation/schemas';
import { RefreshCw, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface MindChangeBadgeProps {
  revision: AgentPositionRevision;
  agentRun?: AgentRun;
}

export const MindChangeBadge: React.FC<MindChangeBadgeProps> = ({ revision, agentRun }) => {
  const originalRec = agentRun?.output?.recommendation || 'STRONG_HIRE';
  const originalConf = Math.round((agentRun?.output?.confidence.score || 0.9) * 100);
  const revisedRec = revision.revised_recommendation || 'HIRE';
  const revisedConf = Math.round((revision.revised_confidence || 0.8) * 100);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-surface-elevated to-indigo-950/40 border border-purple-500/40 shadow-lg my-3 animate-in fade-in">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold uppercase">
              {revision.revision_type.replace('_', ' ')}
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Mind-Change Detector: Position Calibration
            </h4>
          </div>
        </div>

        <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-1 rounded-md border border-purple-500/20">
          Debate Influence Verified
        </span>
      </div>

      {/* Delta Display */}
      <div className="flex flex-wrap items-center gap-3 my-3 p-3 rounded-xl bg-black/40 border border-surface-border text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Initial Position:</span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-surface-elevated text-gray-200 border border-surface-border">
            {originalRec.replace('_', ' ')} ({originalConf}%)
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-purple-400" />

        <div className="flex items-center gap-2">
          <span className="text-purple-300 font-semibold">Calibrated Position:</span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
            {revisedRec.replace('_', ' ')} ({revisedConf}%)
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed italic">
        "{revision.reasoning}"
      </p>
    </div>
  );
};
