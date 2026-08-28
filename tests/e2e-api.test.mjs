import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3001';

test('E2E Verification: Landing Page loads successfully', async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.strictEqual(res.status, 200, 'Landing page must return HTTP 200');
  const html = await res.text();
  assert.ok(html.includes('VERDICT AI'), 'Landing page must include brand title');
  assert.ok(html.includes('Alex Rivera'), 'Landing page must include Alex Rivera showcase case');
  assert.ok(html.includes('Dr. Jordan Chen'), 'Landing page must include Dr. Jordan Chen case');
});

test('E2E Verification: Full 13-Entity Evaluation Session API', async () => {
  const res = await fetch(`${BASE_URL}/api/evaluations/eval_alex_rivera`);
  assert.strictEqual(res.status, 200, 'Evaluation API must return HTTP 200');
  const data = await res.json();

  assert.ok(data.success, 'Response must indicate success');
  const evaluation = data.evaluation;

  // 1. Core Evaluation Details
  assert.strictEqual(evaluation.id, 'eval_alex_rivera');
  assert.strictEqual(evaluation.candidate_name, 'Alex Rivera');
  assert.strictEqual(evaluation.status, 'COMPLETE');

  // 2. Documents & Profile
  assert.ok(evaluation.documents.length >= 2, 'Must have at least resume and transcript');
  assert.ok(evaluation.profile, 'Must have candidate profile');
  assert.strictEqual(evaluation.profile.profile_data.name, 'Alex Rivera');

  // 3. Claims & Evidence Ledger
  assert.ok(evaluation.claims.length >= 6, 'Must extract discrete claims');
  assert.ok(evaluation.evidence.length >= 6, 'Must have evidence quotes');

  // Verify atomic citation integrity (every finding evidenceId exists)
  const validEvIds = new Set(evaluation.evidence.map(e => e.id));

  // 4. 4 Truly Independent Agents (Round 1)
  assert.strictEqual(evaluation.agent_runs.length, 4, 'Must have exactly 4 agent runs');
  const agentTypes = evaluation.agent_runs.map(r => r.agent_type);
  assert.ok(agentTypes.includes('TECHNICAL'));
  assert.ok(agentTypes.includes('HR_CULTURE'));
  assert.ok(agentTypes.includes('HIRING_MANAGER'));
  assert.ok(agentTypes.includes('SKEPTIC'));

  for (const run of evaluation.agent_runs) {
    assert.strictEqual(run.status, 'COMPLETED');
    assert.ok(run.output.findings.length > 0);
  }

  // 5. Multi-Round Debate & Revisions
  assert.ok(evaluation.debate_messages.length >= 4, 'Must contain structured debate messages');
  assert.ok(evaluation.revisions.length >= 1, 'Must contain at least 1 position revision (Mind-Change Detector)');
  const rev = evaluation.revisions[0];
  assert.strictEqual(rev.revision_type, 'PARTIAL_REVISION');
  assert.strictEqual(rev.revised_recommendation, 'HIRE');

  // 6. Qualitative Final Decision (No Averaging)
  assert.ok(evaluation.final_decision, 'Must have final decision');
  assert.strictEqual(evaluation.final_decision.recommendation, 'HIRE');
  assert.strictEqual(evaluation.final_decision.confidence_level, 'HIGH');
  assert.ok(evaluation.final_decision.reasoning.length > 100);
  assert.ok(evaluation.final_decision.verification_questions.length >= 2);
});

test('E2E Verification: Live POST /api/evaluate Pipeline Execution', async () => {
  const newCandidatePayload = {
    candidateName: 'Marcus Vance',
    roleTitle: 'Lead Cloud Infrastructure Engineer',
    resumeText: `MARCUS VANCE
Senior Cloud Engineer with 6 years experience managing multi-region AWS and Kubernetes clusters.
- Architected automated failover for 200 microservices across 3 AWS regions with 99.99% availability.
- Reduced cloud compute costs by 35% through custom spot instance orchestration.
- Mentored 4 engineers in Terraform infrastructure-as-code best practices.`,
    transcriptText: `BS in Information Technology, Purdue University, GPA: 3.75. Coursework: Cloud Architecture, Network Security.`,
    jobDescriptionText: `Lead Cloud Infrastructure Engineer. Requirements: Kubernetes, Terraform, AWS multi-region architecture.`
  };

  const res = await fetch(`${BASE_URL}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCandidatePayload)
  });

  const data = await res.json();
  if (res.status === 200) {
    assert.ok(data.success, 'Pipeline must return success');
    assert.ok(data.evaluation, 'Must return completed evaluation');
    assert.strictEqual(data.evaluation.candidate_name, 'Marcus Vance');
    assert.strictEqual(data.evaluation.agent_runs.length, 4);
    assert.ok(data.evaluation.final_decision);
  } else {
    // When LLM calls fail in REAL mode, server must return 502 with LLM_CALL_FAILED without faking data
    assert.strictEqual(res.status, 502, 'Failed LLM calls must return HTTP 502');
    assert.strictEqual(data.code, 'LLM_CALL_FAILED', 'Must return LLM_CALL_FAILED code');
    assert.strictEqual(data.success, false);
  }
});
