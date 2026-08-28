import {
  FinalDecision,
  FinalDecisionSchema,
  CandidateProfile,
  Evidence,
  Claim,
  AgentRun,
  DebateMessage,
  AgentPositionRevision,
  ConflictRecord,
  ClaimStatus
} from '../validation/schemas';
import { GeminiAIClient } from '../ai/gemini-client';
import { FINAL_DELIBERATOR_SYSTEM_PROMPT } from '../ai/prompts/final-deliberator';

export class DeliberationService {
  public static async deliberate(params: {
    evaluationId: string;
    candidateProfile: CandidateProfile;
    evidence: Evidence[];
    claims: Claim[];
    agentRuns: AgentRun[];
    debateMessages: DebateMessage[];
    revisions: AgentPositionRevision[];
    conflicts: ConflictRecord[];
    mode?: 'REAL' | 'DEMO';
  }): Promise<{ finalDecision: FinalDecision; updatedClaimStatuses: { claimId: string; status: ClaimStatus }[] }> {
    const { evaluationId, candidateProfile, evidence, claims, agentRuns, debateMessages, revisions, conflicts } = params;
    const mode = params.mode || (GeminiAIClient.isConfigured() ? 'REAL' : 'DEMO');
    const now = new Date().toISOString();
    const decisionId = `dec_${Date.now()}`;

    console.log('[Gemini] Final Deliberator — mode:', mode);

    const claimUpdates = this.deriveClaimStatuses(claims, evidence, conflicts, revisions);

    if (mode === 'REAL') {
      const finalDecision = await this.deliberateViaGemini({
        evaluationId, decisionId, candidateProfile, evidence, claims,
        agentRuns, debateMessages, revisions, conflicts, now
      });
      return { finalDecision, updatedClaimStatuses: claimUpdates };
    }

    // DEMO mode
    const finalDecision = this.deliberateDemo({
      evaluationId, decisionId, candidateProfile, evidence, claims,
      agentRuns, debateMessages, revisions, conflicts, now
    });
    return { finalDecision, updatedClaimStatuses: claimUpdates };
  }

  // ── REAL MODE ─────────────────────────────────────────────────────────────
  private static async deliberateViaGemini(params: {
    evaluationId: string; decisionId: string; candidateProfile: CandidateProfile;
    evidence: Evidence[]; claims: Claim[]; agentRuns: AgentRun[];
    debateMessages: DebateMessage[]; revisions: AgentPositionRevision[];
    conflicts: ConflictRecord[]; now: string;
  }): Promise<FinalDecision> {
    const { evaluationId, decisionId, candidateProfile, evidence, agentRuns, debateMessages, revisions, conflicts } = params;

    const opinionsSummary = agentRuns
      .map(r => `- ${r.agent_type}: Rec=${r.output?.recommendation || r.recommendation}, Conf=${r.output?.confidence.score || r.confidence}, Reason: "${r.output?.confidence.reason || ''}"`)
      .join('\n');
    const debateSummary = debateMessages
      .map(m => `[Turn ${m.sequence_number}] ${m.speaker_agent_type} -> ${m.target_agent_type || 'ALL'} (${m.message_type}): "${m.content}"`)
      .join('\n');
    const revisionsSummary = revisions
      .map(rev => `- ${rev.agent_run_id}: ${rev.revision_type}, New Rec=${rev.revised_recommendation}, Conf=${rev.revised_confidence}. Reason: "${rev.reasoning}"`)
      .join('\n') || 'No formal revisions recorded.';
    const conflictSummary = conflicts.map(c => `- ${c.description} [${c.status}]`).join('\n');
    const evidenceSummary = evidence.map(e => `[${e.id}] "${e.quote_text}"`).join('\n');

    const userPrompt = `
<CANDIDATE_PROFILE>
Name: ${candidateProfile.profile_data.name}
Degree: ${candidateProfile.profile_data.education.degree} (${candidateProfile.profile_data.education.institution})
</CANDIDATE_PROFILE>

<EVIDENCE_LEDGER>
${evidenceSummary}
</EVIDENCE_LEDGER>

<INITIAL_AGENT_OPINIONS>
${opinionsSummary}
</INITIAL_AGENT_OPINIONS>

<DEBATE_TRANSCRIPT>
${debateSummary}
</DEBATE_TRANSCRIPT>

<POSITION_REVISIONS>
${revisionsSummary}
</POSITION_REVISIONS>

<CONFLICT_STATUSES>
${conflictSummary}
</CONFLICT_STATUSES>

INSTRUCTION: Synthesize the final hiring verdict qualitatively. Do NOT average scores. Return strictly valid JSON.
`;

    const res = await GeminiAIClient.generateJSON<any>({
      systemPrompt: FINAL_DELIBERATOR_SYSTEM_PROMPT,
      userPrompt
    });

    if (res.success && res.data?.recommendation) {
      const validated = this.validateFinalDecision(res.data, evaluationId, decisionId, evidence);
      if (validated) return validated;
    }

    // REAL mode hard failure — do NOT produce fake decision
    console.error('[Gemini] Final Deliberator FAILED:', res.error);
    throw new Error('LLM_CALL_FAILED:FINAL_DELIBERATOR');
  }

  // ── DEMO MODE ─────────────────────────────────────────────────────────────
  private static deliberateDemo(params: {
    evaluationId: string; decisionId: string; candidateProfile: CandidateProfile;
    evidence: Evidence[]; claims: Claim[]; agentRuns: AgentRun[];
    debateMessages: DebateMessage[]; revisions: AgentPositionRevision[];
    conflicts: ConflictRecord[]; now: string;
  }): FinalDecision {
    const { evaluationId, decisionId, candidateProfile, evidence, claims, revisions, now } = params;
    const ev1 = evidence[0]?.id || 'EV_001';
    const ev2 = evidence[1]?.id || 'EV_002';
    const ev3 = evidence[2]?.id || 'EV_003';
    const candidateName = candidateProfile.profile_data.name;

    return {
      id: decisionId,
      evaluation_id: evaluationId,
      recommendation: 'HIRE',
      confidence_level: 'HIGH',
      confidence_score: 0.86,
      reasoning: `[DEMO] ${candidateName} is recommended for HIRE based on direct documentary evidence of core distributed backend capabilities (${ev1}, ${ev2}).\n\nThe Skeptic identified an unverified performance metric, prompting the Technical Agent to revise STRONG_HIRE → HIRE. This demonstrates healthy evidentiary calibration. Remaining risk is bounded and addressable via structured interview follow-up.`,
      strengths: [
        { statement: '[DEMO] Verified distributed backend implementation evidence.', evidenceIds: [ev1, ev2].filter(Boolean), supportingAgents: ['TECHNICAL', 'HIRING_MANAGER'] },
        { statement: '[DEMO] Consistent team ownership trajectory.', evidenceIds: [ev3 || ev1].filter(Boolean), supportingAgents: ['HR_CULTURE'] }
      ],
      concerns: [
        { statement: '[DEMO] Performance gain percentages lack baseline benchmark telemetry.', evidenceIds: [ev1].filter(Boolean), raisingAgent: 'SKEPTIC', severity: 'MEDIUM' }
      ],
      verification_questions: [
        { question: 'What was the p99 baseline latency before and after the reported optimization?', claimId: claims[0]?.id || 'CL_001', relatedConflictId: 'CONF_001', intent: '[DEMO] Verify empirical measurement methodology.' }
      ],
      model_name: 'demo-deliberator-v1',
      created_at: now
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private static validateFinalDecision(
    data: any,
    evaluationId: string,
    decisionId: string,
    evidenceList: Evidence[]
  ): FinalDecision | null {
    try {
      const validEvIds = new Set(evidenceList.map(e => e.id));
      data.id = decisionId;
      data.evaluation_id = evaluationId;
      data.created_at = new Date().toISOString();
      data.model_name = 'gemini-2.0-flash';

      for (const s of (data.strengths || [])) {
        if (Array.isArray(s.evidenceIds)) s.evidenceIds = s.evidenceIds.filter((id: string) => validEvIds.has(id));
      }
      for (const c of (data.concerns || [])) {
        if (Array.isArray(c.evidenceIds)) c.evidenceIds = c.evidenceIds.filter((id: string) => validEvIds.has(id));
      }

      return FinalDecisionSchema.parse(data);
    } catch (e) {
      console.warn('[Gemini] Final decision schema validation failed:', e);
      return null;
    }
  }

  private static deriveClaimStatuses(
    claims: Claim[], evidence: Evidence[],
    conflicts: ConflictRecord[], revisions: AgentPositionRevision[]
  ): { claimId: string; status: ClaimStatus }[] {
    return claims.map(c => {
      const isDisputed = conflicts.some(conf => conf.related_claim_id === c.id);
      if (isDisputed && c.category === 'ACHIEVEMENT') return { claimId: c.id, status: 'PARTIALLY_SUPPORTED' as ClaimStatus };
      if (c.category === 'SKILL' && !evidence.some(e => e.claim_id === c.id)) return { claimId: c.id, status: 'UNVERIFIED' as ClaimStatus };
      return { claimId: c.id, status: 'WELL_SUPPORTED' as ClaimStatus };
    });
  }
}
