import test from 'node:test';
import assert from 'node:assert';
import { DeliberationService } from '../lib/services/deliberation-service.ts';

test('Non-Averaged Qualitative Synthesis Test', async (t) => {
  // Candidate with 3 high scores (1.0, 1.0, 1.0) and 1 low score (0.2) representing an unmitigated HIGH severity concern
  const mockProfile = {
    id: 'prof_test_na',
    evaluation_id: 'eval_test_na',
    extraction_model: 'test-model',
    generated_at: new Date().toISOString(),
    profile_data: {
      name: 'High Risk Candidate',
      education: { degree: 'B.S. CS', institution: 'State', gpa: '3.5', coursework: [], certifications: [] },
      skills: { languages: ['Python'], frameworks: [], tools: [], cloud: [], databases: [], other: [] },
      experience: [],
      projects: []
    }
  };

  const mockEvidence = [
    {
      id: 'EV_001',
      evaluation_id: 'eval_test_na',
      claim_id: 'CL_001',
      document_id: 'doc_01',
      quote_text: 'Core Python backend project.',
      created_at: new Date().toISOString()
    }
  ];

  const mockClaims = [
    {
      id: 'CL_001',
      evaluation_id: 'eval_test_na',
      candidate_profile_id: 'prof_test_na',
      claim_text: 'Core Python backend project.',
      status: 'UNVERIFIED',
      created_at: new Date().toISOString()
    }
  ];

  const mockAgentRuns = [
    {
      id: 'run_tech',
      evaluation_id: 'eval_test_na',
      agent_type: 'TECHNICAL',
      status: 'COMPLETED',
      retry_count: 0,
      recommendation: 'STRONG_HIRE',
      confidence: 1.0,
      created_at: new Date().toISOString()
    },
    {
      id: 'run_hr',
      evaluation_id: 'eval_test_na',
      agent_type: 'HR_CULTURE',
      status: 'COMPLETED',
      retry_count: 0,
      recommendation: 'STRONG_HIRE',
      confidence: 1.0,
      created_at: new Date().toISOString()
    },
    {
      id: 'run_hm',
      evaluation_id: 'eval_test_na',
      agent_type: 'HIRING_MANAGER',
      status: 'COMPLETED',
      retry_count: 0,
      recommendation: 'STRONG_HIRE',
      confidence: 1.0,
      created_at: new Date().toISOString()
    },
    {
      id: 'run_skep',
      evaluation_id: 'eval_test_na',
      agent_type: 'SKEPTIC',
      status: 'COMPLETED',
      retry_count: 0,
      recommendation: 'REJECT',
      confidence: 0.2,
      created_at: new Date().toISOString()
    }
  ];

  const { finalDecision } = await DeliberationService.deliberate({
    evaluationId: 'eval_test_na',
    candidateProfile: mockProfile,
    evidence: mockEvidence,
    claims: mockClaims,
    agentRuns: mockAgentRuns,
    debateMessages: [],
    revisions: [],
    conflicts: []
  });

  assert.ok(finalDecision, 'Final decision must be produced');
  assert.ok(finalDecision.reasoning.length > 50, 'Must include detailed qualitative rationale');
  assert.notStrictEqual(
    finalDecision.confidence_score,
    (1.0 + 1.0 + 1.0 + 0.2) / 4,
    'Decision confidence must NEVER equal simple arithmetic average (0.80)'
  );
});
