import { EvaluationFullAggregate, EvaluationStatus, ClaimStatus } from '../validation/schemas';
import { SEED_EVALUATIONS } from './seed-data';

class DatabaseRepository {
  private evaluations: Map<string, EvaluationFullAggregate> = new Map();

  constructor() {
    // Seed initial data
    for (const [id, evalData] of Object.entries(SEED_EVALUATIONS)) {
      this.evaluations.set(id, JSON.parse(JSON.stringify(evalData)));
    }
  }

  public getAllEvaluations(): EvaluationFullAggregate[] {
    return Array.from(this.evaluations.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getEvaluation(id: string): EvaluationFullAggregate | null {
    const item = this.evaluations.get(id);
    if (!item) return null;
    return JSON.parse(JSON.stringify(item));
  }

  public createEvaluation(params: {
    id: string;
    candidate_id: string;
    candidate_name: string;
    role_title?: string;
    documents?: EvaluationFullAggregate['documents'];
  }): EvaluationFullAggregate {
    const now = new Date().toISOString();
    const newEval: EvaluationFullAggregate = {
      id: params.id,
      candidate_id: params.candidate_id,
      candidate_name: params.candidate_name,
      role_title: params.role_title || 'Software Engineer',
      status: 'DOCUMENTS_PENDING',
      evaluation_mode: 'DEMO' as 'REAL' | 'DEMO',
      created_at: now,
      updated_at: now,
      documents: params.documents || [],
      profile: null,
      claims: [],
      evidence: [],
      agent_runs: [],
      revisions: [],
      debate_session: null,
      conflicts: [],
      debate_messages: [],
      final_decision: null
    };

    this.evaluations.set(newEval.id, newEval);
    return JSON.parse(JSON.stringify(newEval));
  }

  public updateEvaluationMode(id: string, mode: 'REAL' | 'DEMO'): void {
    const item = this.evaluations.get(id);
    if (!item) return;
    item.evaluation_mode = mode;
    this.evaluations.set(id, item);
  }

  public updateEvaluationStatus(id: string, status: EvaluationStatus): EvaluationFullAggregate | null {
    const item = this.evaluations.get(id);
    if (!item) return null;
    item.status = status;
    item.updated_at = new Date().toISOString();
    this.evaluations.set(id, item);
    return JSON.parse(JSON.stringify(item));
  }

  public saveCandidateProfile(
    evaluationId: string,
    profile: EvaluationFullAggregate['profile'],
    claims: EvaluationFullAggregate['claims'],
    evidence: EvaluationFullAggregate['evidence']
  ): EvaluationFullAggregate | null {
    const item = this.evaluations.get(evaluationId);
    if (!item) return null;
    item.profile = profile;
    item.claims = claims;
    item.evidence = evidence;
    item.status = 'PROFILE_READY';
    item.updated_at = new Date().toISOString();
    this.evaluations.set(evaluationId, item);
    return JSON.parse(JSON.stringify(item));
  }

  public saveAgentRuns(
    evaluationId: string,
    agentRuns: EvaluationFullAggregate['agent_runs']
  ): EvaluationFullAggregate | null {
    const item = this.evaluations.get(evaluationId);
    if (!item) return null;
    item.agent_runs = agentRuns;
    item.status = 'AGENTS_COMPLETE';
    item.updated_at = new Date().toISOString();
    this.evaluations.set(evaluationId, item);
    return JSON.parse(JSON.stringify(item));
  }

  public saveSingleAgentRun(
    evaluationId: string,
    agentRun: EvaluationFullAggregate['agent_runs'][0]
  ): EvaluationFullAggregate | null {
    const item = this.evaluations.get(evaluationId);
    if (!item) return null;
    const idx = item.agent_runs.findIndex(r => r.agent_type === agentRun.agent_type);
    if (idx >= 0) {
      item.agent_runs[idx] = agentRun;
    } else {
      item.agent_runs.push(agentRun);
    }
    item.updated_at = new Date().toISOString();
    this.evaluations.set(evaluationId, item);
    return JSON.parse(JSON.stringify(item));
  }

  public saveDebateState(
    evaluationId: string,
    debateSession: EvaluationFullAggregate['debate_session'],
    conflicts: EvaluationFullAggregate['conflicts'],
    debateMessages: EvaluationFullAggregate['debate_messages'],
    revisions: EvaluationFullAggregate['revisions']
  ): EvaluationFullAggregate | null {
    const item = this.evaluations.get(evaluationId);
    if (!item) return null;
    item.debate_session = debateSession;
    item.conflicts = conflicts;
    item.debate_messages = debateMessages;
    item.revisions = revisions;
    item.status = 'DEBATE_COMPLETE';
    item.updated_at = new Date().toISOString();
    this.evaluations.set(evaluationId, item);
    return JSON.parse(JSON.stringify(item));
  }

  public addPositionRevision(
    evaluationId: string,
    revision: EvaluationFullAggregate['revisions'][0]
  ): EvaluationFullAggregate | null {
    const item = this.evaluations.get(evaluationId);
    if (!item) return null;
    item.revisions.push(revision);
    item.updated_at = new Date().toISOString();
    this.evaluations.set(evaluationId, item);
    return JSON.parse(JSON.stringify(item));
  }

  public saveFinalDecision(
    evaluationId: string,
    decision: EvaluationFullAggregate['final_decision'],
    claimStatusUpdates?: { claimId: string; status: ClaimStatus }[]
  ): EvaluationFullAggregate | null {
    const item = this.evaluations.get(evaluationId);
    if (!item) return null;
    item.final_decision = decision;
    if (claimStatusUpdates && claimStatusUpdates.length > 0) {
      const now = new Date().toISOString();
      for (const update of claimStatusUpdates) {
        const claim = item.claims.find(c => c.id === update.claimId);
        if (claim) {
          claim.status = update.status;
          claim.status_updated_at = now;
        }
      }
    }
    item.status = 'COMPLETE';
    item.updated_at = new Date().toISOString();
    this.evaluations.set(evaluationId, item);
    return JSON.parse(JSON.stringify(item));
  }

  public deleteEvaluation(id: string): boolean {
    return this.evaluations.delete(id);
  }
}

// Global singleton — persists across Next.js hot-reloads in dev and across module re-evaluations.
// Note: in a true serverless deployment (Vercel Edge/Lambda), each cold start gets a fresh instance;
// this is expected for an in-memory store. The singleton prevents duplicates within the same process.
const globalForDb = globalThis as unknown as { dbRepository: DatabaseRepository };
export const dbRepository = globalForDb.dbRepository ?? new DatabaseRepository();
globalForDb.dbRepository = dbRepository;
