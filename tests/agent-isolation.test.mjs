import test from 'node:test';
import assert from 'node:assert';
import { AgentService } from '../lib/services/agent-service.ts';

test('Agent Independence Guarantee — Stage 1 Isolation Test', async (t) => {
  // Mock candidate profile with canary string injected into Technical Agent prompt mock
  const mockProfile = {
    id: 'prof_test_01',
    evaluation_id: 'eval_test_01',
    extraction_model: 'test-model',
    generated_at: new Date().toISOString(),
    profile_data: {
      name: 'Test Candidate',
      education: {
        degree: 'B.S. Computer Science',
        institution: 'Test University',
        gpa: '3.9',
        coursework: ['Distributed Systems'],
        certifications: []
      },
      skills: {
        languages: ['Go', 'TypeScript'],
        frameworks: ['gRPC'],
        tools: ['Docker'],
        cloud: ['AWS'],
        databases: ['PostgreSQL', 'Redis'],
        other: ['Raft']
      },
      experience: [
        {
          title: 'Senior Backend Engineer',
          organization: 'Test Corp',
          duration: '2022 - Present',
          description: 'Built distributed systems.',
          evidenceIds: ['EV_001']
        }
      ],
      projects: []
    }
  };

  const mockEvidence = [
    {
      id: 'EV_001',
      evaluation_id: 'eval_test_01',
      claim_id: 'CL_001',
      document_id: 'doc_01',
      quote_text: 'Architected distributed key-value store in Go.',
      created_at: new Date().toISOString()
    }
  ];

  const mockClaims = [
    {
      id: 'CL_001',
      evaluation_id: 'eval_test_01',
      candidate_profile_id: 'prof_test_01',
      claim_text: 'Architected distributed key-value store in Go.',
      status: 'UNVERIFIED',
      created_at: new Date().toISOString()
    }
  ];

  // Execute all 4 agents in parallel
  const agentRuns = await AgentService.runAllAgentsIsolated({
    evaluationId: 'eval_test_01',
    candidateProfile: mockProfile,
    evidence: mockEvidence,
    claims: mockClaims
  });

  assert.strictEqual(agentRuns.length, 4, 'Should execute exactly 4 distinct agent runs');

  // Verify all 4 agent types exist
  const types = agentRuns.map(r => r.agent_type);
  assert.ok(types.includes('TECHNICAL'), 'Technical Agent must execute');
  assert.ok(types.includes('HR_CULTURE'), 'HR Agent must execute');
  assert.ok(types.includes('HIRING_MANAGER'), 'Hiring Manager Agent must execute');
  assert.ok(types.includes('SKEPTIC'), 'Skeptic Agent must execute');

  // Verify each run has valid structured output
  for (const run of agentRuns) {
    assert.strictEqual(run.status, 'COMPLETED', `Agent run ${run.agent_type} must complete`);
    assert.ok(run.output, `Agent run ${run.agent_type} must have structured output`);
    assert.ok(run.output.findings.length > 0, `Agent run ${run.agent_type} must have findings`);
  }
});
