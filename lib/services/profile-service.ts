import { CandidateProfile, Claim, Evidence, DocumentType } from '../validation/schemas';
import { GeminiAIClient } from '../ai/gemini-client';
import { PROFILE_BUILDER_SYSTEM_PROMPT } from '../ai/prompts/profile-builder';

export interface RawDocumentInput {
  id: string;
  document_type: DocumentType;
  original_filename: string;
  text_content: string;
  pages?: { pageNumber: number; text: string; characterCount?: number }[];
}

// Thrown when Gemini fails and there is no safe fallback
export class LLMCallFailedError extends Error {
  constructor(public readonly stage: string) {
    super(`LLM_CALL_FAILED:${stage}`);
    this.name = 'LLMCallFailedError';
  }
}

export class ProfileService {
  /**
   * Builds structured profile via Gemini (REAL mode) or deterministic text parser (DEMO mode).
   * In REAL mode: any LLM failure throws LLMCallFailedError — never silently falls back.
   */
  public static async buildProfile(
    evaluationId: string,
    candidateName: string,
    documents: RawDocumentInput[],
    mode?: 'REAL' | 'DEMO'
  ): Promise<{ profile: CandidateProfile; claims: Claim[]; evidence: Evidence[] }> {
    const effectiveMode = mode || (GeminiAIClient.isConfigured() ? 'REAL' : 'DEMO');
    console.log('[Gemini] Profile Builder — mode:', effectiveMode);

    if (effectiveMode === 'REAL') {
      return this.buildProfileViaGemini(evaluationId, candidateName, documents);
    }
    return this.buildProfileDeterministic(evaluationId, candidateName, documents);
  }

  private static async buildProfileViaGemini(
    evaluationId: string,
    candidateName: string,
    documents: RawDocumentInput[]
  ): Promise<{ profile: CandidateProfile; claims: Claim[]; evidence: Evidence[] }> {
    const combinedDocText = documents
      .map(d => {
        const pageHeader = d.pages && d.pages.length > 1
          ? ` (${d.pages.length} pages parsed)`
          : '';
        return `--- DOCUMENT: ${d.document_type} [${d.original_filename}]${pageHeader} ---\n${d.text_content}`;
      })
      .join('\n\n');

    const userPrompt = `Build the Candidate Profile, Claims, and Evidence from these documents:\n\n<CANDIDATE_DOCUMENTS>\n${combinedDocText}\n</CANDIDATE_DOCUMENTS>`;

    const res = await GeminiAIClient.generateJSON<any>({
      systemPrompt: PROFILE_BUILDER_SYSTEM_PROMPT,
      userPrompt
    });

    if (!res.success || !res.data || !res.data.skills) {
      console.error('[Gemini] Profile Builder FAILED:', res.error);
      throw new LLMCallFailedError('PROFILE_BUILDER');
    }

    const data = res.data;
    const now = new Date().toISOString();
    const profileId = `prof_${Date.now()}`;

    const claims: Claim[] = (data.claims || []).map((c: any, idx: number) => ({
      id: c.claim_id || `CL_${String(idx + 1).padStart(3, '0')}`,
      evaluation_id: evaluationId,
      candidate_profile_id: profileId,
      claim_text: c.claim_text || c.claim || '',
      category: c.category || 'EXPERIENCE',
      status: 'UNVERIFIED' as const,
      created_at: now
    }));

    const evidenceList: Evidence[] = (data.evidence || []).map((e: any, idx: number) => {
      const quote = e.quote || e.quote_text || '';
      const provenance = ProfileService.locateEvidenceProvenance(quote, documents);

      return {
        id: e.evidence_id || `EV_${String(idx + 1).padStart(3, '0')}`,
        evaluation_id: evaluationId,
        claim_id: e.claim_id || (claims[idx]?.id ?? null),
        document_id: provenance.document_id,
        quote_text: quote,
        location: {
          section: e.location?.section || provenance.section,
          page: provenance.page || e.location?.page || 1,
          document_name: provenance.document_name
        },
        created_at: now
      };
    });

    const profile: CandidateProfile = {
      id: profileId,
      evaluation_id: evaluationId,
      extraction_model: 'gemini-2.0-flash',
      generated_at: now,
      profile_data: {
        name: data.name || candidateName,
        education: data.education || { degree: 'B.S. Computer Science', institution: 'University', gpa: null, coursework: [], certifications: [] },
        skills: data.skills || { languages: [], frameworks: [], tools: [], cloud: [], databases: [], other: [] },
        experience: data.experience || [],
        projects: data.projects || []
      }
    };

    return { profile, claims, evidence: evidenceList };
  }

  // ── DEMO / DETERMINISTIC MODE ──────────────────────────────────────────────
  public static buildProfileDeterministic(
    evaluationId: string,
    candidateName: string,
    documents: RawDocumentInput[]
  ): { profile: CandidateProfile; claims: Claim[]; evidence: Evidence[] } {
    const now = new Date().toISOString();
    const profileId = `prof_${Date.now()}`;
    const resume = documents.find(d => d.document_type === 'RESUME') || documents[0];
    const text = resume?.text_content || '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets = lines
      .filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'))
      .map(l => l.replace(/^[-•*]\s*/, ''));

    const rawClaims = bullets.length > 0 ? bullets.slice(0, 6) : [
      'Engineered core backend services in Go and PostgreSQL.',
      'Reduced API latency by 40% through Redis caching.',
      'Handled 50,000 req/sec in distributed event queue.',
      'Mentored junior engineers in distributed systems design.'
    ];

    const claims: Claim[] = rawClaims.map((claimText, idx) => ({
      id: `CL_${String(idx + 1).padStart(3, '0')}`,
      evaluation_id: evaluationId,
      candidate_profile_id: profileId,
      claim_text: claimText,
      category: (idx === 3 ? 'LEADERSHIP' : idx === 1 ? 'ACHIEVEMENT' : 'EXPERIENCE') as any,
      status: 'UNVERIFIED' as const,
      created_at: now
    }));

    const evidenceList: Evidence[] = rawClaims.map((claimText, idx) => {
      const provenance = ProfileService.locateEvidenceProvenance(claimText, documents);
      return {
        id: `EV_${String(idx + 1).padStart(3, '0')}`,
        evaluation_id: evaluationId,
        claim_id: claims[idx].id,
        document_id: provenance.document_id,
        quote_text: claimText,
        location: {
          section: 'Experience',
          page: provenance.page,
          document_name: provenance.document_name
        },
        created_at: now
      };
    });

    const lower = text.toLowerCase();
    const profile: CandidateProfile = {
      id: profileId,
      evaluation_id: evaluationId,
      extraction_model: 'demo-heuristic-v1',
      generated_at: now,
      profile_data: {
        name: candidateName || lines[0] || 'Candidate Profile',
        education: {
          degree: 'B.S. in Computer Science',
          institution: 'Accredited University',
          gpa: '3.8',
          coursework: ['Distributed Systems', 'Algorithms'],
          certifications: []
        },
        skills: {
          languages: ['Go', 'TypeScript', 'Python', 'Java', 'SQL'].filter(l => lower.includes(l.toLowerCase())).concat(['Go']).slice(0, 4),
          frameworks: ['gRPC', 'FastAPI', 'React', 'Next.js'].filter(f => lower.includes(f.toLowerCase())),
          tools: ['Docker', 'Git', 'Kubernetes'].filter(t => lower.includes(t.toLowerCase())).concat(['Docker']).slice(0, 3),
          cloud: ['AWS', 'GCP'],
          databases: ['PostgreSQL', 'Redis', 'Kafka'].filter(d => lower.includes(d.toLowerCase())).concat(['PostgreSQL']).slice(0, 3),
          other: ['Distributed Systems Architecture']
        },
        experience: [{
          title: 'Senior Backend Engineer',
          organization: 'Tech Corp',
          duration: '2022 - Present',
          description: rawClaims.slice(0, 2).join(' '),
          evidenceIds: ['EV_001', 'EV_002']
        }],
        projects: []
      }
    };

    return { profile, claims, evidence: evidenceList };
  }

  /**
   * Helper: Locates exact document & page provenance for an evidence quote.
   */
  public static locateEvidenceProvenance(
    quote: string,
    documents: RawDocumentInput[]
  ): { document_id: string; document_name: string; page: number; section: string } {
    if (!documents || documents.length === 0) {
      return { document_id: 'doc_resume', document_name: 'Resume.pdf', page: 1, section: 'Experience' };
    }

    const cleanQuote = (quote || '').toLowerCase().trim().slice(0, 50);

    for (const doc of documents) {
      if (doc.pages && doc.pages.length > 0) {
        for (const p of doc.pages) {
          if (cleanQuote && p.text.toLowerCase().includes(cleanQuote)) {
            return {
              document_id: doc.id,
              document_name: doc.original_filename,
              page: p.pageNumber,
              section: doc.document_type === 'RESUME' ? 'Experience / Skills' : doc.document_type
            };
          }
        }
      }
      if (cleanQuote && doc.text_content.toLowerCase().includes(cleanQuote)) {
        return {
          document_id: doc.id,
          document_name: doc.original_filename,
          page: 1,
          section: doc.document_type
        };
      }
    }

    const first = documents[0];
    return {
      document_id: first.id,
      document_name: first.original_filename,
      page: 1,
      section: first.document_type === 'RESUME' ? 'Experience' : first.document_type
    };
  }
}
