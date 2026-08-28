import { z } from 'zod';

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

export const AgentTypeEnum = z.enum(['TECHNICAL', 'HR_CULTURE', 'HIRING_MANAGER', 'SKEPTIC']);
export type AgentType = z.infer<typeof AgentTypeEnum>;

export const RecommendationEnum = z.enum([
  'STRONG_HIRE',
  'HIRE',
  'INTERVIEW_RECOMMENDED',
  'HOLD',
  'REJECT'
]);
export type Recommendation = z.infer<typeof RecommendationEnum>;

export const ConfidenceLevelEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;

export const FindingStanceEnum = z.enum(['STRENGTH', 'CONCERN', 'NEUTRAL']);
export type FindingStance = z.infer<typeof FindingStanceEnum>;

export const SupportLevelEnum = z.enum([
  'STRONGLY_SUPPORTED',
  'SUPPORTED',
  'WEAKLY_SUPPORTED',
  'INSUFFICIENT_EVIDENCE',
  'CONTRADICTED'
]);
export type SupportLevel = z.infer<typeof SupportLevelEnum>;

export const SeverityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']).nullable();
export type Severity = z.infer<typeof SeverityEnum>;

export const ClaimCategoryEnum = z.enum([
  'SKILL',
  'EXPERIENCE',
  'ACHIEVEMENT',
  'LEADERSHIP',
  'PROJECT',
  'OTHER'
]);
export type ClaimCategory = z.infer<typeof ClaimCategoryEnum>;

export const ClaimStatusEnum = z.enum([
  'VERIFIED',
  'WELL_SUPPORTED',
  'PARTIALLY_SUPPORTED',
  'UNVERIFIED',
  'CONTRADICTED'
]);
export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;

export const ConflictTypeEnum = z.enum([
  'RECOMMENDATION_CONTRADICTION',
  'CLAIM_DISAGREEMENT',
  'EVIDENCE_INTERPRETATION_CONFLICT',
  'HIGH_SEVERITY_CONCERN'
]);
export type ConflictType = z.infer<typeof ConflictTypeEnum>;

export const ConflictStatusEnum = z.enum(['RESOLVED', 'PARTIALLY_RESOLVED', 'UNRESOLVED']);
export type ConflictStatus = z.infer<typeof ConflictStatusEnum>;

export const MessageTypeEnum = z.enum([
  'CHALLENGE',
  'RESPONSE',
  'AGREEMENT',
  'DISAGREEMENT',
  'DEFENSE',
  'REVISION'
]);
export type MessageType = z.infer<typeof MessageTypeEnum>;

export const RevisionTypeEnum = z.enum([
  'FULL_REVISION',
  'PARTIAL_REVISION',
  'MAINTAINED_WITH_ADDITIONAL_EVIDENCE'
]);
export type RevisionType = z.infer<typeof RevisionTypeEnum>;

export const EvaluationStatusEnum = z.enum([
  'DOCUMENTS_PENDING',
  'PROCESSING',
  'PROFILE_READY',
  'AGENTS_RUNNING',
  'AGENT_FAILED',
  'AGENTS_COMPLETE',
  'DEBATE_IN_PROGRESS',
  'DEBATE_COMPLETE',
  'DELIBERATING',
  'COMPLETE',
  'FAILED'
]);
export type EvaluationStatus = z.infer<typeof EvaluationStatusEnum>;

export const DocumentTypeEnum = z.enum([
  'RESUME',
  'TRANSCRIPT',
  'JOB_DESCRIPTION',
  'INTERVIEW_TRANSCRIPT'
]);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

// ==========================================
// CORE SCHEMAS
// ==========================================

export const LocationSchema = z.object({
  section: z.string().optional(),
  page: z.number().optional(),
  paragraph: z.number().optional()
}).catchall(z.any());
export type Location = z.infer<typeof LocationSchema>;

export const EvidenceSchema = z.object({
  id: z.string(),
  evaluation_id: z.string(),
  claim_id: z.string().nullable().optional(),
  document_id: z.string(),
  quote_text: z.string(),
  location: LocationSchema.optional().nullable(),
  created_at: z.string().optional()
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const ClaimSchema = z.object({
  id: z.string(),
  evaluation_id: z.string(),
  candidate_profile_id: z.string(),
  claim_text: z.string(),
  category: ClaimCategoryEnum.optional().nullable(),
  status: ClaimStatusEnum,
  status_updated_at: z.string().optional().nullable(),
  created_at: z.string().optional()
});
export type Claim = z.infer<typeof ClaimSchema>;

export const EducationItemSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  gpa: z.union([z.number(), z.string()]).nullable().optional(),
  coursework: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([])
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

export const SkillsSchema = z.object({
  languages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  cloud: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  other: z.array(z.string()).default([])
});
export type Skills = z.infer<typeof SkillsSchema>;

export const ExperienceItemSchema = z.object({
  title: z.string(),
  organization: z.string(),
  duration: z.string(),
  description: z.string(),
  evidenceIds: z.array(z.string()).optional().default([])
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const ProjectItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).optional().default([]),
  evidenceIds: z.array(z.string()).optional().default([])
});
export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const CandidateProfileDataSchema = z.object({
  name: z.string().default('Candidate'),
  education: EducationItemSchema,
  skills: SkillsSchema,
  experience: z.array(ExperienceItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([])
});
export type CandidateProfileData = z.infer<typeof CandidateProfileDataSchema>;

export const CandidateProfileSchema = z.object({
  id: z.string(),
  evaluation_id: z.string(),
  profile_data: CandidateProfileDataSchema,
  extraction_model: z.string(),
  generated_at: z.string()
});
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

// ==========================================
// AGENT FINDINGS & OPINIONS
// ==========================================

export const FindingSchema = z.object({
  finding_id: z.string(),
  statement: z.string(),
  stance: FindingStanceEnum,
  evidence_ids: z.array(z.string()),
  support_level: SupportLevelEnum,
  severity: SeverityEnum
});
export type Finding = z.infer<typeof FindingSchema>;

export const ClaimToInvestigateSchema = z.object({
  claim_id: z.string(),
  reason: z.string()
});
export type ClaimToInvestigate = z.infer<typeof ClaimToInvestigateSchema>;

export const AgentConfidenceSchema = z.object({
  level: ConfidenceLevelEnum,
  score: z.number().min(0).max(1),
  reason: z.string()
});
export type AgentConfidence = z.infer<typeof AgentConfidenceSchema>;

export const AgentOpinionSchema = z.object({
  agent_type: AgentTypeEnum,
  recommendation: RecommendationEnum,
  confidence: AgentConfidenceSchema,
  findings: z.array(FindingSchema),
  claims_to_investigate: z.array(ClaimToInvestigateSchema).default([]),
  questions_for_debate: z.array(z.string()).default([])
});
export type AgentOpinion = z.infer<typeof AgentOpinionSchema>;

export const AgentRunSchema = z.object({
  id: z.string(),
  evaluation_id: z.string(),
  agent_type: AgentTypeEnum,
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']),
  retry_count: z.number().default(0),
  model_name: z.string().optional().nullable(),
  prompt_version: z.string().optional().nullable(),
  recommendation: z.string().optional().nullable(),
  confidence: z.number().nullable().optional(),
  output: AgentOpinionSchema.optional().nullable(),
  started_at: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  created_at: z.string()
});
export type AgentRun = z.infer<typeof AgentRunSchema>;

// ==========================================
// DEBATE & REVISIONS
// ==========================================

export const CompetingFindingSchema = z.object({
  agent: AgentTypeEnum,
  finding_id: z.string(),
  stance: FindingStanceEnum
});
export type CompetingFinding = z.infer<typeof CompetingFindingSchema>;

export const ConflictTopicSchema = z.object({
  conflict_id: z.string(),
  topic: z.string(),
  conflict_type: ConflictTypeEnum,
  involved_agents: z.array(AgentTypeEnum).min(2),
  competing_findings: z.array(CompetingFindingSchema).default([]),
  evidence_ids: z.array(z.string()).default([]),
  priority: z.number().min(0).max(1)
});
export type ConflictTopic = z.infer<typeof ConflictTopicSchema>;

export const ConflictRecordSchema = z.object({
  id: z.string(),
  debate_session_id: z.string(),
  conflict_type: ConflictTypeEnum,
  description: z.string(),
  agent_types: z.array(AgentTypeEnum),
  related_claim_id: z.string().nullable().optional(),
  status: ConflictStatusEnum,
  created_at: z.string(),
  resolved_at: z.string().nullable().optional()
});
export type ConflictRecord = z.infer<typeof ConflictRecordSchema>;

export const DebateStructuredContentSchema = z.object({
  targetFinding: z.string().optional(),
  challenge: z.string().optional(),
  evidenceContext: z.array(z.string()).optional(),
  rebuttalReason: z.string().optional()
}).catchall(z.any());
export type DebateStructuredContent = z.infer<typeof DebateStructuredContentSchema>;

export const DebateMessageSchema = z.object({
  id: z.string(),
  debate_session_id: z.string(),
  conflict_id: z.string().nullable().optional(),
  sequence_number: z.number(),
  speaker_agent_type: AgentTypeEnum,
  target_agent_type: AgentTypeEnum.nullable().optional(),
  message_type: MessageTypeEnum,
  content: z.string(),
  structured_content: DebateStructuredContentSchema.nullable().optional(),
  created_at: z.string()
});
export type DebateMessage = z.infer<typeof DebateMessageSchema>;

export const AgentPositionRevisionSchema = z.object({
  id: z.string(),
  agent_run_id: z.string(),
  debate_message_id: z.string().nullable().optional(),
  revision_type: RevisionTypeEnum,
  revised_recommendation: z.string().nullable().optional(),
  revised_confidence: z.number().nullable().optional(),
  reasoning: z.string(),
  output: z.any().nullable().optional(),
  created_at: z.string()
});
export type AgentPositionRevision = z.infer<typeof AgentPositionRevisionSchema>;

export const DebateSessionSchema = z.object({
  id: z.string(),
  evaluation_id: z.string(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  round_count: z.number().default(0),
  max_rounds: z.number().default(5),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional()
});
export type DebateSession = z.infer<typeof DebateSessionSchema>;

// ==========================================
// FINAL DELIBERATION & DECISION
// ==========================================

export const FinalDecisionStrengthSchema = z.object({
  statement: z.string(),
  evidenceIds: z.array(z.string()),
  supportingAgents: z.array(AgentTypeEnum)
});
export type FinalDecisionStrength = z.infer<typeof FinalDecisionStrengthSchema>;

export const FinalDecisionConcernSchema = z.object({
  statement: z.string(),
  evidenceIds: z.array(z.string()),
  raisingAgent: AgentTypeEnum,
  severity: z.enum(['HIGH', 'MEDIUM', 'LOW'])
});
export type FinalDecisionConcern = z.infer<typeof FinalDecisionConcernSchema>;

export const VerificationQuestionSchema = z.object({
  question: z.string(),
  claimId: z.string().optional().nullable(),
  relatedConflictId: z.string().optional().nullable(),
  intent: z.string().optional()
});
export type VerificationQuestion = z.infer<typeof VerificationQuestionSchema>;

export const FinalDecisionSchema = z.object({
  id: z.string(),
  evaluation_id: z.string(),
  recommendation: RecommendationEnum,
  confidence_level: ConfidenceLevelEnum,
  confidence_score: z.number().min(0).max(1).nullable().optional(),
  reasoning: z.string(),
  strengths: z.array(FinalDecisionStrengthSchema).default([]),
  concerns: z.array(FinalDecisionConcernSchema).default([]),
  verification_questions: z.array(VerificationQuestionSchema).default([]),
  model_name: z.string().nullable().optional(),
  created_at: z.string()
});
export type FinalDecision = z.infer<typeof FinalDecisionSchema>;

// ==========================================
// FULL EVALUATION AGGREGATE
// ==========================================

export interface EvaluationFullAggregate {
  id: string;
  candidate_id: string;
  candidate_name: string;
  role_title?: string;
  status: EvaluationStatus;
  /** Determined server-side: REAL = live Gemini calls, DEMO = deterministic mock data */
  evaluation_mode: 'REAL' | 'DEMO';
  created_at: string;
  updated_at: string;
  documents: {
    id: string;
    document_type: DocumentType;
    original_filename: string;
    status: string;
    file_size_bytes: number;
    text_content?: string;
  }[];
  profile: CandidateProfile | null;
  claims: Claim[];
  evidence: Evidence[];
  agent_runs: AgentRun[];
  revisions: AgentPositionRevision[];
  debate_session: DebateSession | null;
  conflicts: ConflictRecord[];
  debate_messages: DebateMessage[];
  final_decision: FinalDecision | null;
}
