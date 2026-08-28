import { dbRepository } from '../db/repository';
import { ProfileService, RawDocumentInput } from './profile-service';
import { AgentService } from './agent-service';
import { ConflictService } from './conflict-service';
import { DebateService } from './debate-service';
import { DeliberationService } from './deliberation-service';
import { GeminiAIClient } from '../ai/gemini-client';
import { EvaluationFullAggregate } from '../validation/schemas';

export class EvaluationOrchestrator {
  public static async executeFullPipeline(params: {
    evaluationId: string;
    candidateName: string;
    roleTitle?: string;
    documents: RawDocumentInput[];
  }): Promise<EvaluationFullAggregate> {
    const { evaluationId, candidateName, roleTitle, documents } = params;

    // Determine mode server-side — never from the client
    const mode: 'REAL' | 'DEMO' = GeminiAIClient.isConfigured() ? 'REAL' : 'DEMO';
    console.log(`[Pipeline] Evaluation ${evaluationId} — mode: ${mode}`);

    // Store mode on the evaluation record for the UI badge
    dbRepository.updateEvaluationMode(evaluationId, mode);
    dbRepository.updateEvaluationStatus(evaluationId, 'PROCESSING');

    // Stage 2: Profile Builder (1 LLM call in REAL mode)
    const { profile, claims, evidence } = await ProfileService.buildProfile(
      evaluationId, candidateName, documents, mode
    );
    dbRepository.saveCandidateProfile(evaluationId, profile, claims, evidence);

    // Stage 3: 4 Independent Agent Runs via Promise.all (4 parallel LLM calls in REAL)
    dbRepository.updateEvaluationStatus(evaluationId, 'AGENTS_RUNNING');
    const jobDoc = documents.find(d => d.document_type === 'JOB_DESCRIPTION');
    const agentRuns = await AgentService.runAllAgentsIsolated({
      evaluationId,
      candidateProfile: profile,
      evidence,
      claims,
      jobDescription: jobDoc?.text_content || roleTitle,
      mode
    });
    dbRepository.saveAgentRuns(evaluationId, agentRuns);

    // Check for hard failures in REAL mode before continuing
    if (mode === 'REAL') {
      const failedAgents = agentRuns.filter(r => r.status === 'FAILED');
      if (failedAgents.length > 0) {
        const names = failedAgents.map(r => r.agent_type).join(', ');
        throw new Error(`LLM_CALL_FAILED:AGENTS [${names}]`);
      }
    }

    // Stage 4: Conflict Detection (deterministic, no LLM)
    const debateSessionId = `deb_session_${Date.now()}`;
    const { conflictTopics, conflictRecords } = ConflictService.detectConflicts({
      debateSessionId, agentRuns, claims, evidence
    });

    // Stage 5: Debate (2 LLM calls per conflict topic in REAL mode)
    dbRepository.updateEvaluationStatus(evaluationId, 'DEBATE_IN_PROGRESS');
    const { debateSession, conflicts, debateMessages, revisions } = await DebateService.runDebate({
      evaluationId, debateSessionId, conflictTopics, conflictRecords, agentRuns, evidence, claims, mode
    });
    dbRepository.saveDebateState(evaluationId, debateSession, conflicts, debateMessages, revisions);

    // Stage 6: Final Deliberation (1 LLM call in REAL mode)
    dbRepository.updateEvaluationStatus(evaluationId, 'DELIBERATING');
    const { finalDecision, updatedClaimStatuses } = await DeliberationService.deliberate({
      evaluationId, candidateProfile: profile, evidence, claims,
      agentRuns, debateMessages, revisions, conflicts, mode
    });

    const completedEvaluation = dbRepository.saveFinalDecision(evaluationId, finalDecision, updatedClaimStatuses);
    return completedEvaluation || dbRepository.getEvaluation(evaluationId)!;
  }
}
