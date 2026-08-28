import {
  AgentType,
  Recommendation,
  ConfidenceLevel,
  FindingStance,
  SupportLevel,
  Severity,
  ClaimCategory,
  ClaimStatus,
  ConflictType,
  ConflictStatus,
  MessageType,
  RevisionType,
  EvaluationStatus,
  DocumentType,
  Location,
  CandidateProfileData,
  AgentOpinion,
  ConflictTopic,
  FinalDecisionStrength,
  FinalDecisionConcern,
  VerificationQuestion
} from '../validation/schemas';

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface CandidateRow {
  id: string;
  full_name: string;
  email?: string | null;
  created_at: string;
}

export interface EvaluationRow {
  id: string;
  candidate_id: string;
  user_id?: string | null;
  role_title?: string | null;
  status: EvaluationStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  evaluation_id: string;
  document_type: DocumentType;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  checksum_sha256?: string | null;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  text_content?: string;
  uploaded_at: string;
  processed_at?: string | null;
}

export interface CandidateProfileRow {
  id: string;
  evaluation_id: string;
  profile_data: CandidateProfileData;
  extraction_model: string;
  generated_at: string;
}

export interface ClaimRow {
  id: string;
  evaluation_id: string;
  candidate_profile_id: string;
  claim_text: string;
  category?: ClaimCategory | null;
  status: ClaimStatus;
  status_updated_at?: string | null;
  created_at: string;
}

export interface EvidenceRow {
  id: string;
  evaluation_id: string;
  claim_id?: string | null;
  document_id: string;
  quote_text: string;
  location?: Location | null;
  created_at: string;
}

export interface AgentRunRow {
  id: string;
  evaluation_id: string;
  agent_type: AgentType;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  retry_count: number;
  model_name?: string | null;
  prompt_version?: string | null;
  recommendation?: string | null;
  confidence?: number | null;
  output?: AgentOpinion | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface AgentPositionRevisionRow {
  id: string;
  agent_run_id: string;
  debate_message_id?: string | null;
  revision_type: RevisionType;
  revised_recommendation?: string | null;
  revised_confidence?: number | null;
  reasoning: string;
  output?: any | null;
  created_at: string;
}

export interface DebateSessionRow {
  id: string;
  evaluation_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  round_count: number;
  max_rounds: number;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface ConflictRow {
  id: string;
  debate_session_id: string;
  conflict_type: ConflictType;
  description: string;
  agent_types: AgentType[];
  related_claim_id?: string | null;
  status: ConflictStatus;
  created_at: string;
  resolved_at?: string | null;
}

export interface DebateMessageRow {
  id: string;
  debate_session_id: string;
  conflict_id?: string | null;
  sequence_number: number;
  speaker_agent_type: AgentType;
  target_agent_type?: AgentType | null;
  message_type: MessageType;
  content: string;
  structured_content?: any | null;
  created_at: string;
}

export interface FinalDecisionRow {
  id: string;
  evaluation_id: string;
  recommendation: Recommendation;
  confidence_level: ConfidenceLevel;
  confidence_score?: number | null;
  reasoning: string;
  strengths: FinalDecisionStrength[];
  concerns: FinalDecisionConcern[];
  verification_questions: VerificationQuestion[];
  model_name?: string | null;
  created_at: string;
}
