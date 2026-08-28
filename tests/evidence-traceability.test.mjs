import test from 'node:test';
import assert from 'node:assert';
import { SEED_EVALUATIONS } from '../lib/db/seed-data.ts';

test('100% Evidence Traceability Guarantee Test', (t) => {
  for (const [evalId, evaluation] of Object.entries(SEED_EVALUATIONS)) {
    const validEvidenceIds = new Set(evaluation.evidence.map(e => e.id));

    // Check all agent findings
    for (const run of evaluation.agent_runs) {
      if (run.output && run.output.findings) {
        for (const finding of run.output.findings) {
          for (const evId of finding.evidence_ids) {
            assert.ok(
              validEvidenceIds.has(evId),
              `Finding in ${run.agent_type} references non-existent evidence ID: ${evId}`
            );
          }
        }
      }
    }

    // Check final decision strengths
    if (evaluation.final_decision) {
      for (const strength of evaluation.final_decision.strengths) {
        for (const evId of strength.evidenceIds) {
          assert.ok(
            validEvidenceIds.has(evId),
            `Final decision strength references invalid evidence ID: ${evId}`
          );
        }
      }
    }
  }
});
