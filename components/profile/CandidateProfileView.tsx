'use client';

import React from 'react';
import { CandidateProfile, Evidence, Claim } from '@/lib/validation/schemas';
import { getEvidenceDisplayLabel } from '@/lib/utils/display-labels';
import { ExternalLink } from 'lucide-react';

interface CandidateProfileViewProps {
  profile: CandidateProfile | null;
  claims: Claim[];
  evidence: Evidence[];
  onSelectEvidence: (ev: Evidence) => void;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  profile,
  claims,
  evidence,
  onSelectEvidence
}) => {
  if (!profile) {
    return (
      <div className="py-12 text-center border-t border-zinc-900">
        <p className="text-xs text-zinc-600 font-sans">
          Extracting candidate profile and grounding evidence ledger...
        </p>
      </div>
    );
  }

  const pd = profile.profile_data;
  const skills = pd.skills || { languages: [], frameworks: [], tools: [], cloud: [], databases: [], other: [] };
  const experience = pd.experience || [];
  const projects = pd.projects || [];

  return (
    <div className="space-y-0 animate-in fade-in duration-300">
      {/* ── HEADER ── */}
      <div className="pb-8 border-b border-zinc-900">
        <p className="case-label mb-2">normalized candidate profile</p>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h2 className="font-display text-white" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              {pd.name}
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Education: <span className="text-zinc-200">{pd.education.degree}</span> · {pd.education.institution} {pd.education.gpa ? `(GPA: ${pd.education.gpa})` : ''}
            </p>
          </div>

          <div className="flex items-baseline gap-6 shrink-0 font-mono text-xs">
            <div>
              <span className="case-label block">CLAIMS</span>
              <span className="text-sm font-bold text-white">{claims.length}</span>
            </div>
            <div>
              <span className="case-label block">QUOTES</span>
              <span className="text-sm font-bold text-white">{evidence.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SKILLS AUDIT ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">technical stack &amp; competency audit</p>
        <div className="space-y-0">
          {skills.languages && skills.languages.length > 0 && (
            <div className="dossier-entry">
              <span className="case-label w-28 shrink-0 pt-0.5">LANGUAGES</span>
              <p className="text-xs text-zinc-300 font-mono">{skills.languages.join(' · ')}</p>
            </div>
          )}

          {skills.frameworks && skills.frameworks.length > 0 && (
            <div className="dossier-entry">
              <span className="case-label w-28 shrink-0 pt-0.5">FRAMEWORKS</span>
              <p className="text-xs text-zinc-300 font-mono">{skills.frameworks.join(' · ')}</p>
            </div>
          )}

          {skills.cloud && skills.cloud.length > 0 && (
            <div className="dossier-entry">
              <span className="case-label w-28 shrink-0 pt-0.5">INFRA / CLOUD</span>
              <p className="text-xs text-zinc-300 font-mono">{skills.cloud.join(' · ')}</p>
            </div>
          )}

          {skills.databases && skills.databases.length > 0 && (
            <div className="dossier-entry">
              <span className="case-label w-28 shrink-0 pt-0.5">DATABASES</span>
              <p className="text-xs text-zinc-300 font-mono">{skills.databases.join(' · ')}</p>
            </div>
          )}

          {skills.tools && skills.tools.length > 0 && (
            <div className="dossier-entry">
              <span className="case-label w-28 shrink-0 pt-0.5">DEV TOOLS</span>
              <p className="text-xs text-zinc-300 font-mono">{skills.tools.join(' · ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── WORK EXPERIENCE ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">documented employment history</p>
        <div className="space-y-0">
          {experience.map((exp, idx) => (
            <div key={idx} className="dossier-entry">
              <div className="w-28 shrink-0 pt-0.5">
                <span className="font-mono text-[11px] text-zinc-600 block">
                  {exp.duration || 'N/A'}
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-sans font-semibold text-white">
                    {exp.title} <span className="text-zinc-500 font-normal">at</span> {exp.organization}
                  </p>
                </div>

                {exp.description && (
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KEY PROJECTS ── */}
      {projects.length > 0 && (
        <div className="dossier-section">
          <p className="case-label mb-4">notable projects &amp; deliverables</p>
          <div className="space-y-0">
            {projects.map((proj, idx) => (
              <div key={idx} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-28 shrink-0 pt-0.5">PROJ #{idx + 1}</span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-sans font-semibold text-white">{proj.name}</p>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[10px] font-mono text-zinc-600 pt-1">
                      Stack: {proj.technologies.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VERBATIM EVIDENCE LEDGER PREVIEW ── */}
      <div className="dossier-section">
        <p className="case-label mb-4">immutable verbatim evidence ledger ({evidence.length})</p>
        <div className="space-y-0">
          {evidence.map((ev, idx) => {
            const label = getEvidenceDisplayLabel(ev);
            return (
              <div key={ev.id} className="dossier-entry">
                <span className="font-mono text-[11px] text-zinc-600 w-28 shrink-0 pt-0.5">
                  EV #{String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectEvidence(ev)}
                      className="text-xs font-mono text-zinc-300 hover:text-white underline underline-offset-2 flex items-center gap-1"
                    >
                      {label} <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">
                      {ev.location?.document_name || (ev.document_id.includes('transcript') ? 'Transcript' : ev.document_id.includes('jd') ? 'Job Description' : 'Resume')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed italic">
                    &ldquo;{ev.quote_text}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
