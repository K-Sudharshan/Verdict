'use client';

import React, { useState } from 'react';
import { 
  DebateSession, 
  ConflictRecord, 
  DebateMessage, 
  AgentPositionRevision, 
  AgentRun, 
  Evidence 
} from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel } from '@/lib/utils/display-labels';
import { VoiceHiringRoom } from './VoiceHiringRoom';
import { MindChangeBadge } from './MindChangeBadge';
import { ExternalLink } from 'lucide-react';

interface DebateRoomProps {
  debateSession: DebateSession | null;
  conflicts: ConflictRecord[];
  debateMessages: DebateMessage[];
  revisions: AgentPositionRevision[];
  agentRuns: AgentRun[];
  evidenceList: Evidence[];
  onSelectEvidence: (ev: Evidence) => void;
}

const AGENT_CODE: Record<string, string> = {
  TECHNICAL: 'TECH',
  HR_CULTURE: 'HR',
  HIRING_MANAGER: 'MGR',
  SKEPTIC: 'SKPT'
};

export const DebateRoom: React.FC<DebateRoomProps> = ({
  debateSession,
  conflicts,
  debateMessages,
  revisions,
  agentRuns,
  evidenceList,
  onSelectEvidence
}) => {
  const [selectedConflictId, setSelectedConflictId] = useState<string | 'ALL'>('ALL');

  if (!debateSession || debateMessages.length === 0) {
    return (
      <div className="py-12 text-center border-t border-zinc-900">
        <p className="text-xs text-zinc-600 font-sans">
          Cross-examination transcript pending — debate begins automatically once initial agent analyses complete.
        </p>
      </div>
    );
  }

  const filteredMessages = selectedConflictId === 'ALL'
    ? debateMessages
    : debateMessages.filter(m => m.conflict_id === selectedConflictId);

  return (
    <div className="space-y-0 animate-in fade-in duration-300">
      {/* Audio Room */}
      <VoiceHiringRoom messages={debateMessages} />

      {/* Topics Header & Filter */}
      <div className="dossier-section">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-4">
          <div>
            <p className="case-label mb-1">cross-examination topics</p>
            <h2 className="font-display text-xl text-white" style={{ fontFamily: 'Abril Fatface, serif' }}>
              Detected Discrepancies &amp; Challenges ({conflicts.length})
            </h2>
          </div>

          {/* Filter Links */}
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <button
              onClick={() => setSelectedConflictId('ALL')}
              className={`text-[11px] pb-0.5 border-b transition-colors ${
                selectedConflictId === 'ALL'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
            >
              ALL TURNS ({debateMessages.length})
            </button>
            {conflicts.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedConflictId(c.id)}
                className={`text-[11px] pb-0.5 border-b transition-colors ${
                  selectedConflictId === c.id
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-zinc-600 hover:text-zinc-300'
                }`}
              >
                TOPIC #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-0">
          {conflicts.map((conf, idx) => (
            <div
              key={conf.id}
              onClick={() => setSelectedConflictId(conf.id)}
              className={`dossier-entry cursor-pointer hover:bg-zinc-950 px-2 -mx-2 transition-colors ${
                selectedConflictId === conf.id ? 'bg-zinc-950' : ''
              }`}
            >
              <span className="font-mono text-[11px] text-zinc-600 w-8 shrink-0 pt-0.5">#{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="stamp">{conf.status.replace(/_/g, ' ')}</span>
                  <span className="case-label">
                    Agents: {conf.agent_types.map(at => AGENT_CODE[at] || at).join(' vs ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">{conf.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Feed */}
      <div className="dossier-section">
        <div className="flex items-baseline justify-between mb-4">
          <p className="case-label">adversarial examination transcript</p>
          <span className="text-[10px] font-mono text-zinc-600">{filteredMessages.length} turns recorded</span>
        </div>

        <div className="space-y-0">
          {filteredMessages.map((msg) => {
            const isRevision = msg.message_type === 'REVISION';
            const revisionData = isRevision ? revisions.find(r => r.debate_message_id === msg.id || r.reasoning) : null;
            const matchingRun = agentRuns.find(r => r.agent_type === msg.speaker_agent_type);
            const speakerCode = AGENT_CODE[msg.speaker_agent_type] || msg.speaker_agent_type;
            const targetCode = msg.target_agent_type ? (AGENT_CODE[msg.target_agent_type] || msg.target_agent_type) : null;

            return (
              <div key={msg.id} className="dossier-entry">
                {/* Monogram / Turn # */}
                <div className="w-12 shrink-0 pt-0.5">
                  <span className="block font-sans text-[11px] tracking-wider uppercase font-bold text-zinc-300">
                    {speakerCode}
                  </span>
                  <span className="block font-mono text-[9px] text-zinc-600 mt-0.5">
                    T{msg.sequence_number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="stamp">{msg.message_type}</span>
                    {targetCode && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        → {targetCode}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                    &ldquo;{msg.content}&rdquo;
                  </p>

                  {/* Mind change notation */}
                  {isRevision && revisionData && (
                    <MindChangeBadge revision={revisionData} agentRun={matchingRun} />
                  )}

                  {/* Citations */}
                  {msg.structured_content?.evidenceContext && msg.structured_content.evidenceContext.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-600 font-mono">Cited:</span>
                      {msg.structured_content.evidenceContext.map((evId: string) => {
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
