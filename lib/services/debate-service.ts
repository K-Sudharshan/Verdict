import {
  AgentRun,
  ConflictTopic,
  ConflictRecord,
  DebateMessage,
  AgentPositionRevision,
  DebateSession,
  Evidence,
  Claim,
  AgentType,
  RevisionType
} from '../validation/schemas';
import { GeminiAIClient } from '../ai/gemini-client';
import { DEBATE_CHALLENGE_PROMPT, DEBATE_RESPONSE_PROMPT } from '../ai/prompts/debate-turn';

export class DebateService {
  public static async runDebate(params: {
    evaluationId: string;
    debateSessionId: string;
    conflictTopics: ConflictTopic[];
    conflictRecords: ConflictRecord[];
    agentRuns: AgentRun[];
    evidence: Evidence[];
    claims: Claim[];
    mode?: 'REAL' | 'DEMO';
  }): Promise<{
    debateSession: DebateSession;
    conflicts: ConflictRecord[];
    debateMessages: DebateMessage[];
    revisions: AgentPositionRevision[];
  }> {
    const { evaluationId, debateSessionId, conflictTopics, conflictRecords, agentRuns, evidence } = params;
    const mode = params.mode || (GeminiAIClient.isConfigured() ? 'REAL' : 'DEMO');

    const messages: DebateMessage[] = [];
    const revisions: AgentPositionRevision[] = [];
    const updatedConflicts = [...conflictRecords];
    let seq = 1;
    const now = new Date().toISOString();

    for (const topic of conflictTopics.slice(0, 2)) {
      const challenger = topic.involved_agents[1] || 'SKEPTIC' as AgentType;
      const target = topic.involved_agents[0] || 'TECHNICAL' as AgentType;
      const matchedRecord = updatedConflicts.find(c => c.id === topic.conflict_id);

      // Turn 1: Challenge
      console.log('[Gemini] Debate Challenge — mode:', mode);
      const challengeTurn = await this.generateChallengeTurn({
        challenger, target, topic, agentRuns, evidence, debateSessionId, sequenceNumber: seq++, mode
      });
      messages.push(challengeTurn);

      // Turn 2: Response & Position Review
      console.log('[Gemini] Debate Response — mode:', mode);
      const responseTurn = await this.generateResponseTurn({
        challenger, target, topic, challengeText: challengeTurn.content,
        agentRuns, evidence, debateSessionId, sequenceNumber: seq++, mode
      });
      messages.push(responseTurn.message);
      if (responseTurn.revision) revisions.push(responseTurn.revision);

      if (matchedRecord) {
        matchedRecord.status = responseTurn.revision ? 'RESOLVED' : 'PARTIALLY_RESOLVED';
        matchedRecord.resolved_at = new Date().toISOString();
      }
    }

    const debateSession: DebateSession = {
      id: debateSessionId,
      evaluation_id: evaluationId,
      status: 'COMPLETED',
      round_count: conflictTopics.length,
      max_rounds: 5,
      started_at: now,
      completed_at: new Date().toISOString()
    };

    return { debateSession, conflicts: updatedConflicts, debateMessages: messages, revisions };
  }

  private static async generateChallengeTurn(params: {
    challenger: AgentType; target: AgentType; topic: ConflictTopic;
    agentRuns: AgentRun[]; evidence: Evidence[];
    debateSessionId: string; sequenceNumber: number; mode: 'REAL' | 'DEMO';
  }): Promise<DebateMessage> {
    const { challenger, target, topic, agentRuns, evidence, debateSessionId, sequenceNumber, mode } = params;
    const now = new Date().toISOString();
    const targetRun = agentRuns.find(r => r.agent_type === target);
    const targetFinding = targetRun?.output?.findings[0]?.statement || 'Overall high competence';
    const evIds = topic.evidence_ids.length > 0 ? topic.evidence_ids : [evidence[0]?.id || 'EV_001'];
    const evQuote = evidence.find(e => evIds.includes(e.id))?.quote_text || 'Demonstrated architecture skills';

    if (mode === 'REAL') {
      const prompt = DEBATE_CHALLENGE_PROMPT
        .replace('{challenger_agent}', challenger)
        .replace('{target_agent}', target)
        .replace('{conflict_topic}', topic.topic)
        .replace('{evidence_context}', `Target Finding: "${targetFinding}". Evidence: ${evIds.join(', ')} ("${evQuote}")`);

      const res = await GeminiAIClient.generateJSON<any>({
        systemPrompt: 'You are an adversarial AI debate orchestrator.',
        userPrompt: prompt
      });

      if (res.success && res.data?.content) {
        return {
          id: `msg_${Date.now()}_${sequenceNumber}`,
          debate_session_id: debateSessionId,
          conflict_id: topic.conflict_id,
          sequence_number: sequenceNumber,
          speaker_agent_type: challenger,
          target_agent_type: target,
          message_type: 'CHALLENGE',
          content: res.data.content,
          structured_content: { targetFinding: res.data.target_finding || targetFinding, evidenceContext: evIds },
          created_at: now
        };
      }

      // REAL mode: Gemini failed — return error message, do NOT fake challenge
      console.error('[Gemini] Debate Challenge FAILED');
      return {
        id: `msg_${Date.now()}_${sequenceNumber}`,
        debate_session_id: debateSessionId,
        conflict_id: topic.conflict_id,
        sequence_number: sequenceNumber,
        speaker_agent_type: challenger,
        target_agent_type: target,
        message_type: 'CHALLENGE',
        content: 'LLM_CALL_FAILED: Debate challenge could not be generated. Gemini API did not return a valid response.',
        structured_content: { error: 'LLM_CALL_FAILED', evidenceContext: evIds },
        created_at: now
      };
    }

    // DEMO mode — labeled fallback
    const content = challenger === 'SKEPTIC'
      ? `[DEMO] ${target} Agent, you cited ${evIds.join(', ')} as proof of mastery: "${evQuote}" — but no baseline metrics or concurrency parameters are provided. On what evidence do you infer high-scale distributed mastery?`
      : `[DEMO] ${target} Agent, how does the documentary evidence confirm readiness for independent production on-call responsibilities?`;

    return {
      id: `msg_${Date.now()}_${sequenceNumber}`,
      debate_session_id: debateSessionId,
      conflict_id: topic.conflict_id,
      sequence_number: sequenceNumber,
      speaker_agent_type: challenger,
      target_agent_type: target,
      message_type: 'CHALLENGE',
      content,
      structured_content: { evidenceContext: evIds },
      created_at: now
    };
  }

  private static async generateResponseTurn(params: {
    challenger: AgentType; target: AgentType; topic: ConflictTopic;
    challengeText: string; agentRuns: AgentRun[]; evidence: Evidence[];
    debateSessionId: string; sequenceNumber: number; mode: 'REAL' | 'DEMO';
  }): Promise<{ message: DebateMessage; revision: AgentPositionRevision | null }> {
    const { challenger, target, topic, challengeText, agentRuns, evidence, debateSessionId, sequenceNumber, mode } = params;
    const now = new Date().toISOString();
    const targetRun = agentRuns.find(r => r.agent_type === target);
    const evIds = topic.evidence_ids.length > 0 ? topic.evidence_ids : [evidence[0]?.id || 'EV_001'];

    if (mode === 'REAL') {
      const prompt = DEBATE_RESPONSE_PROMPT
        .replace('{target_agent}', target)
        .replace('{challenger_agent}', challenger)
        .replace('{challenge_text}', challengeText);

      const res = await GeminiAIClient.generateJSON<any>({
        systemPrompt: 'You are an AI debater defending or revising your position based on documentary evidence.',
        userPrompt: prompt
      });

      if (res.success && res.data?.content) {
        const msgId = `msg_${Date.now()}_${sequenceNumber}`;
        const isRevision = res.data.action === 'PARTIAL_REVISION' || res.data.action === 'FULL_REVISION';
        let revision: AgentPositionRevision | null = null;
        if (isRevision && targetRun) {
          revision = {
            id: `rev_${Date.now()}`,
            agent_run_id: targetRun.id,
            debate_message_id: msgId,
            revision_type: res.data.action as RevisionType,
            revised_recommendation: res.data.revised_recommendation || 'HIRE',
            revised_confidence: res.data.revised_confidence || 0.82,
            reasoning: res.data.reasoning || 'Position revised after cross-examination.',
            output: null,
            created_at: now
          };
        }
        return {
          message: {
            id: msgId, debate_session_id: debateSessionId, conflict_id: topic.conflict_id,
            sequence_number: sequenceNumber, speaker_agent_type: target, target_agent_type: challenger,
            message_type: isRevision ? 'REVISION' : 'RESPONSE',
            content: res.data.content,
            structured_content: { action: res.data.action, evidenceContext: res.data.evidence_ids || evIds },
            created_at: now
          },
          revision
        };
      }

      // REAL mode: Gemini failed
      console.error('[Gemini] Debate Response FAILED');
      const msgId = `msg_${Date.now()}_${sequenceNumber}`;
      return {
        message: {
          id: msgId, debate_session_id: debateSessionId, conflict_id: topic.conflict_id,
          sequence_number: sequenceNumber, speaker_agent_type: target, target_agent_type: challenger,
          message_type: 'RESPONSE',
          content: 'LLM_CALL_FAILED: Debate response could not be generated.',
          structured_content: { error: 'LLM_CALL_FAILED', evidenceContext: evIds },
          created_at: now
        },
        revision: null
      };
    }

    // DEMO mode — labeled fallback with revision
    const msgId = `msg_${Date.now()}_${sequenceNumber}`;
    let revision: AgentPositionRevision | null = null;

    if (target === 'TECHNICAL') {
      revision = {
        id: `rev_${Date.now()}`,
        agent_run_id: targetRun ? targetRun.id : `run_tech_fallback`,
        debate_message_id: msgId,
        revision_type: 'PARTIAL_REVISION',
        revised_recommendation: 'HIRE',
        revised_confidence: 0.82,
        reasoning: `[DEMO] Conceded ${challenger} critique that percentage metrics lack baseline telemetry. Revised STRONG_HIRE → HIRE.`,
        output: null,
        created_at: now
      };
    }

    const content = target === 'TECHNICAL'
      ? `[DEMO] I acknowledge the ${challenger}'s point on baseline telemetry. Core architecture is firmly supported, but the specific latency percentage is only WEAKLY_SUPPORTED. Revising to HIRE (confidence 0.82).`
      : `[DEMO] The candidate's core stack matches the role. Maintaining recommendation with targeted interview focus on operational readiness.`;

    return {
      message: {
        id: msgId, debate_session_id: debateSessionId, conflict_id: topic.conflict_id,
        sequence_number: sequenceNumber, speaker_agent_type: target, target_agent_type: challenger,
        message_type: revision ? 'REVISION' : 'DEFENSE',
        content,
        structured_content: { evidenceContext: evIds },
        created_at: now
      },
      revision
    };
  }
}
