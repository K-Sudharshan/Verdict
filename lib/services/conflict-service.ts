import {
  AgentRun,
  ConflictTopic,
  ConflictRecord,
  ConflictType,
  Claim,
  Evidence
} from '../validation/schemas';

export class ConflictService {
  public static detectConflicts(params: {
    debateSessionId: string;
    agentRuns: AgentRun[];
    claims: Claim[];
    evidence: Evidence[];
  }): { conflictTopics: ConflictTopic[]; conflictRecords: ConflictRecord[] } {
    const { debateSessionId, agentRuns, claims, evidence } = params;
    const conflictTopics: ConflictTopic[] = [];
    const conflictRecords: ConflictRecord[] = [];
    const now = new Date().toISOString();

    const techRun = agentRuns.find(r => r.agent_type === 'TECHNICAL');
    const skepticRun = agentRuns.find(r => r.agent_type === 'SKEPTIC');
    const hmRun = agentRuns.find(r => r.agent_type === 'HIRING_MANAGER');
    const hrRun = agentRuns.find(r => r.agent_type === 'HR_CULTURE');

    let conflictIndex = 1;

    // 1. Check Recommendation Divergence (Technical vs. Skeptic / HM)
    if (techRun?.output && skepticRun?.output) {
      const techRec = techRun.output.recommendation;
      const skepticRec = skepticRun.output.recommendation;

      if ((techRec === 'STRONG_HIRE' || techRec === 'HIRE') && (skepticRec === 'HOLD' || skepticRec === 'REJECT')) {
        const confId = `CONF_${String(conflictIndex++).padStart(3, '0')}`;
        const relatedClaim = claims.find(c => c.category === 'ACHIEVEMENT' || c.category === 'EXPERIENCE') || claims[0];
        const evIds = evidence.slice(0, 2).map(e => e.id);

        conflictTopics.push({
          conflict_id: confId,
          topic: `Technical Capability Depth vs. Unverified Optimization Metrics`,
          conflict_type: 'EVIDENCE_INTERPRETATION_CONFLICT',
          involved_agents: ['TECHNICAL', 'SKEPTIC'],
          competing_findings: [
            { agent: 'TECHNICAL', finding_id: techRun.output.findings[0]?.finding_id || 'F_TECH_001', stance: 'STRENGTH' },
            { agent: 'SKEPTIC', finding_id: skepticRun.output.findings[0]?.finding_id || 'F_SKEP_001', stance: 'CONCERN' }
          ],
          evidence_ids: evIds,
          priority: 0.92
        });

        conflictRecords.push({
          id: confId,
          debate_session_id: debateSessionId,
          conflict_type: 'EVIDENCE_INTERPRETATION_CONFLICT',
          description: `Disagreement between Technical Agent (${techRec}) and Skeptic (${skepticRec}) on whether candidate achievements reflect verified deep systems mastery or unbacked metrics.`,
          agent_types: ['TECHNICAL', 'SKEPTIC'],
          related_claim_id: relatedClaim?.id || null,
          status: 'UNRESOLVED',
          created_at: now
        });
      }
    }

    // 2. Check High-Severity Risks or Skills Gaps (HM vs. Skeptic)
    if (hmRun?.output && skepticRun?.output) {
      const skepticHighConcerns = skepticRun.output.findings.filter(f => f.stance === 'CONCERN' && (f.severity === 'HIGH' || f.severity === 'MEDIUM'));
      if (skepticHighConcerns.length > 0) {
        const confId = `CONF_${String(conflictIndex++).padStart(3, '0')}`;
        const unverifiedClaim = claims.find(c => c.status === 'UNVERIFIED' || c.category === 'SKILL') || claims[claims.length - 1];

        conflictTopics.push({
          conflict_id: confId,
          topic: `Infrastructure Readiness vs. Auxiliary Skill Verification Risk`,
          conflict_type: 'HIGH_SEVERITY_CONCERN',
          involved_agents: ['HIRING_MANAGER', 'SKEPTIC'],
          competing_findings: [
            { agent: 'HIRING_MANAGER', finding_id: hmRun.output.findings[0]?.finding_id || 'F_HM_001', stance: 'STRENGTH' },
            { agent: 'SKEPTIC', finding_id: skepticHighConcerns[0].finding_id, stance: 'CONCERN' }
          ],
          evidence_ids: skepticHighConcerns[0].evidence_ids || [],
          priority: 0.78
        });

        conflictRecords.push({
          id: confId,
          debate_session_id: debateSessionId,
          conflict_type: 'HIGH_SEVERITY_CONCERN',
          description: `Disagreement on whether unverified secondary skills impact immediate operational onboarding risk.`,
          agent_types: ['HIRING_MANAGER', 'SKEPTIC'],
          related_claim_id: unverifiedClaim?.id || null,
          status: 'UNRESOLVED',
          created_at: now
        });
      }
    }

    // Sort by priority descending
    conflictTopics.sort((a, b) => b.priority - a.priority);

    return { conflictTopics, conflictRecords };
  }
}
