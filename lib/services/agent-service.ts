import {
  AgentType,
  AgentOpinion,
  AgentOpinionSchema,
  AgentRun,
  CandidateProfile,
  Evidence,
  Claim
} from '../validation/schemas';
import { GeminiAIClient } from '../ai/gemini-client';
import { TECHNICAL_AGENT_SYSTEM_PROMPT } from '../ai/prompts/technical-agent';
import { HR_AGENT_SYSTEM_PROMPT } from '../ai/prompts/hr-agent';
import { HIRING_MANAGER_AGENT_SYSTEM_PROMPT } from '../ai/prompts/hiring-manager-agent';
import { SKEPTIC_AGENT_SYSTEM_PROMPT } from '../ai/prompts/skeptic-agent';

export interface Stage1AgentInput {
  agentType: AgentType;
  candidateProfile: CandidateProfile;
  evidence: Evidence[];
  claims: Claim[];
  jobDescription?: string;
}

export class AgentService {
  /**
   * PROMISE.ALL PARALLEL ISOLATED EXECUTION — 4 agents run simultaneously.
   * In REAL mode: any Gemini failure marks that agent FAILED (status='FAILED'),
   * no fake reasoning is generated.
   */
  public static async runAllAgentsIsolated(params: {
    evaluationId: string;
    candidateProfile: CandidateProfile;
    evidence: Evidence[];
    claims: Claim[];
    jobDescription?: string;
    mode?: 'REAL' | 'DEMO';
  }): Promise<AgentRun[]> {
    const { evaluationId, candidateProfile, evidence, claims, jobDescription } = params;
    const mode = params.mode || (GeminiAIClient.isConfigured() ? 'REAL' : 'DEMO');
    const agentTypes: AgentType[] = ['TECHNICAL', 'HR_CULTURE', 'HIRING_MANAGER', 'SKEPTIC'];

    // All 4 execute in strict isolation — no inter-agent context
    const results = await Promise.all(
      agentTypes.map(agentType =>
        this.runSingleAgent({ agentType, candidateProfile, evidence, claims, jobDescription }, evaluationId, mode)
      )
    );

    return results;
  }

  public static async runSingleAgent(
    input: Stage1AgentInput,
    evaluationId: string,
    mode?: 'REAL' | 'DEMO'
  ): Promise<AgentRun> {
    const effectiveMode = mode || (GeminiAIClient.isConfigured() ? 'REAL' : 'DEMO');
    const now = new Date().toISOString();
    const runId = `run_${input.agentType.toLowerCase()}_${Date.now()}`;

    console.log(`[Gemini] ${this.agentLabel(input.agentType)} — mode: ${effectiveMode}`);

    if (effectiveMode === 'REAL') {
      return this.runSingleAgentReal(input, evaluationId, runId, now);
    }
    return this.runSingleAgentDemo(input, evaluationId, runId, now);
  }

  // ── REAL MODE ─────────────────────────────────────────────────────────────
  private static async runSingleAgentReal(
    input: Stage1AgentInput,
    evaluationId: string,
    runId: string,
    now: string
  ): Promise<AgentRun> {
    const systemPrompt = this.getSystemPrompt(input.agentType);
    const userPrompt = this.buildUserPrompt(input);

    let opinion: AgentOpinion | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 2;

    while (attempts < MAX_ATTEMPTS && !opinion) {
      attempts++;
      const res = await GeminiAIClient.generateJSON<AgentOpinion>({ systemPrompt, userPrompt });
      if (res.success && res.data) {
        const validated = this.validateOpinion(res.data, input.evidence, input.agentType);
        if (validated) opinion = validated;
      }
      if (!opinion && attempts < MAX_ATTEMPTS) {
        console.warn(`[Gemini] ${this.agentLabel(input.agentType)} — retry ${attempts}`);
      }
    }

    // Hard failure — do NOT generate fake reasoning
    if (!opinion) {
      console.error(`[Gemini] ${this.agentLabel(input.agentType)} — FAILED after ${MAX_ATTEMPTS} attempts`);
      const failedRun: AgentRun = {
        id: runId,
        evaluation_id: evaluationId,
        agent_type: input.agentType,
        status: 'FAILED',
        retry_count: MAX_ATTEMPTS,
        model_name: 'gemini-2.0-flash',
        prompt_version: 'v1.0',
        recommendation: 'HOLD',
        confidence: 0,
        output: null,
        started_at: now,
        completed_at: new Date().toISOString(),
        created_at: now
      };
      return failedRun;
    }

    return {
      id: runId,
      evaluation_id: evaluationId,
      agent_type: input.agentType,
      status: 'COMPLETED',
      retry_count: attempts - 1,
      model_name: 'gemini-2.0-flash',
      prompt_version: 'v1.0',
      recommendation: opinion.recommendation,
      confidence: opinion.confidence.score,
      output: opinion,
      started_at: now,
      completed_at: new Date().toISOString(),
      created_at: now
    };
  }

  // ── DEMO MODE ─────────────────────────────────────────────────────────────
  // Exclusively used when no Gemini key is present. Model labeled demo-persona-v1.
  private static runSingleAgentDemo(
    input: Stage1AgentInput,
    evaluationId: string,
    runId: string,
    now: string
  ): AgentRun {
    const opinion = this.getDemoPersonaOpinion(input);
    return {
      id: runId,
      evaluation_id: evaluationId,
      agent_type: input.agentType,
      status: 'COMPLETED',
      retry_count: 0,
      model_name: 'demo-persona-v1',
      prompt_version: 'v1.0',
      recommendation: opinion.recommendation,
      confidence: opinion.confidence.score,
      output: opinion,
      started_at: now,
      completed_at: now,
      created_at: now
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private static agentLabel(agentType: AgentType): string {
    const labels: Record<AgentType, string> = {
      TECHNICAL: 'Technical Agent',
      HR_CULTURE: 'HR Agent',
      HIRING_MANAGER: 'Hiring Manager',
      SKEPTIC: 'Skeptic'
    };
    return labels[agentType];
  }

  private static getSystemPrompt(agentType: AgentType): string {
    switch (agentType) {
      case 'TECHNICAL': return TECHNICAL_AGENT_SYSTEM_PROMPT;
      case 'HR_CULTURE': return HR_AGENT_SYSTEM_PROMPT;
      case 'HIRING_MANAGER': return HIRING_MANAGER_AGENT_SYSTEM_PROMPT;
      case 'SKEPTIC': return SKEPTIC_AGENT_SYSTEM_PROMPT;
    }
  }

  private static buildUserPrompt(input: Stage1AgentInput): string {
    const evText = input.evidence.map(e => `[${e.id}] (Claim: ${e.claim_id || 'N/A'}) "${e.quote_text}"`).join('\n');
    const claimsText = input.claims.map(c => `[${c.id}] ${c.claim_text} (Category: ${c.category || 'OTHER'})`).join('\n');
    const pd = input.candidateProfile.profile_data;

    return `
<CANDIDATE_PROFILE>
Name: ${pd.name}
Degree: ${pd.education.degree} (${pd.education.institution}, GPA: ${pd.education.gpa || 'N/A'})
Coursework: ${pd.education.coursework.join(', ')}
Languages: ${pd.skills.languages.join(', ')}
Frameworks: ${pd.skills.frameworks.join(', ')}
Tools: ${pd.skills.tools.join(', ')}
Databases: ${pd.skills.databases.join(', ')}
</CANDIDATE_PROFILE>

<CLAIMS>
${claimsText}
</CLAIMS>

<EVIDENCE_LEDGER>
${evText}
</EVIDENCE_LEDGER>

<TARGET_JOB_DESCRIPTION>
${input.jobDescription || 'Senior Software Engineer: high technical proficiency, team collaboration, reliable delivery.'}
</TARGET_JOB_DESCRIPTION>

Output strictly valid JSON matching your output schema.
`;
  }

  private static validateOpinion(data: any, evidence: Evidence[], agentType: AgentType): AgentOpinion | null {
    try {
      const validIds = new Set(evidence.map(e => e.id));
      if (Array.isArray(data.findings)) {
        for (const f of data.findings) {
          if (Array.isArray(f.evidence_ids)) {
            f.evidence_ids = f.evidence_ids.filter((id: string) => validIds.has(id));
            if (f.evidence_ids.length === 0 && f.stance !== 'NEUTRAL') {
              f.support_level = 'INSUFFICIENT_EVIDENCE';
            }
          }
        }
      }
      data.agent_type = agentType;
      return AgentOpinionSchema.parse(data);
    } catch {
      return null;
    }
  }

  // Demo-only deterministic opinions (clearly labeled, not silently used in REAL mode)
  private static getDemoPersonaOpinion(input: Stage1AgentInput): AgentOpinion {
    const evIds = input.evidence.map(e => e.id);
    const ev1 = evIds[0] || 'EV_001';
    const ev2 = evIds[1] || 'EV_002';
    const ev3 = evIds[2] || 'EV_003';

    switch (input.agentType) {
      case 'TECHNICAL':
        return {
          agent_type: 'TECHNICAL', recommendation: 'STRONG_HIRE',
          confidence: { level: 'HIGH', score: 0.91, reason: '[DEMO] Strong distributed backend stack evidence.' },
          findings: [
            { finding_id: 'F_TECH_001', statement: '[DEMO] Deep distributed systems capability.', stance: 'STRENGTH', evidence_ids: [ev1, ev2].filter(Boolean), support_level: 'STRONGLY_SUPPORTED', severity: null }
          ],
          claims_to_investigate: [], questions_for_debate: ['What profiling tools validated the reported latency reductions?']
        };
      case 'HR_CULTURE':
        return {
          agent_type: 'HR_CULTURE', recommendation: 'HIRE',
          confidence: { level: 'HIGH', score: 0.86, reason: '[DEMO] Clear mentorship and collaboration trajectory.' },
          findings: [
            { finding_id: 'F_HR_001', statement: '[DEMO] Investment in team enablement.', stance: 'STRENGTH', evidence_ids: [ev3 || ev1].filter(Boolean), support_level: 'STRONGLY_SUPPORTED', severity: null }
          ],
          claims_to_investigate: [], questions_for_debate: ['How did the candidate resolve cross-team disagreements?']
        };
      case 'HIRING_MANAGER':
        return {
          agent_type: 'HIRING_MANAGER', recommendation: 'HIRE',
          confidence: { level: 'HIGH', score: 0.85, reason: '[DEMO] Direct role alignment, low onboarding overhead.' },
          findings: [
            { finding_id: 'F_HM_001', statement: '[DEMO] Tech stack matches role requirements.', stance: 'STRENGTH', evidence_ids: [ev1, ev2].filter(Boolean), support_level: 'STRONGLY_SUPPORTED', severity: null }
          ],
          claims_to_investigate: [], questions_for_debate: ['Can the candidate ramp up in the first two weeks?']
        };
      case 'SKEPTIC':
        return {
          agent_type: 'SKEPTIC', recommendation: 'HOLD',
          confidence: { level: 'HIGH', score: 0.80, reason: '[DEMO] Metric claims lack baseline telemetry.' },
          findings: [
            { finding_id: 'F_SKEP_001', statement: '[DEMO] Performance percentages lack baseline measurements.', stance: 'CONCERN', evidence_ids: [ev1].filter(Boolean), support_level: 'WEAKLY_SUPPORTED', severity: 'HIGH' },
            { finding_id: 'F_SKEP_002', statement: '[DEMO] Secondary tools listed without deployment proof.', stance: 'CONCERN', evidence_ids: [], support_level: 'INSUFFICIENT_EVIDENCE', severity: 'MEDIUM' }
          ],
          claims_to_investigate: [], questions_for_debate: ['On what evidence is performance metric attributed to deep mastery?']
        };
    }
  }
}
