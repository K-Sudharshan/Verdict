import test from 'node:test';
import assert from 'node:assert';
import { 
  getEvidenceDisplayLabel, 
  getClaimDisplayLabel, 
  getConflictDisplayLabel, 
  getFindingDisplayLabel,
  sanitizeUserFacingText 
} from '../lib/utils/display-labels.ts';

test('Display Labels: getEvidenceDisplayLabel produces human-readable context labels without raw IDs', (t) => {
  // Test 1: Resume with page & section
  const mockEvidence1 = {
    id: 'EV_001',
    evaluation_id: 'eval_01',
    document_id: 'doc_resume_01',
    quote_text: 'Architected distributed systems in Go.',
    location: {
      document_name: 'Alex_Rivera_Resume.pdf',
      page: 2,
      section: 'Work Experience'
    }
  };

  const label1 = getEvidenceDisplayLabel(mockEvidence1);
  assert.ok(!label1.includes('EV_001'), 'Label must not contain raw EV_001 ID');
  assert.ok(label1.includes('Resume'), 'Label must identify source document');
  assert.ok(label1.includes('Page 2'), 'Label must indicate page number');

  // Test 2: Transcript evidence
  const mockEvidence2 = {
    id: 'EV_002',
    evaluation_id: 'eval_01',
    document_id: 'doc_transcript_01',
    quote_text: 'GPA 3.9 Stanford University',
    location: {
      document_name: 'Stanford_Transcript.pdf',
      page: 1
    }
  };

  const label2 = getEvidenceDisplayLabel(mockEvidence2);
  assert.ok(!label2.includes('EV_002'), 'Must not contain raw EV_002');
  assert.ok(label2.includes('Transcript'), 'Must identify transcript');

  // Test 3: Short format
  const shortLabel = getEvidenceDisplayLabel(mockEvidence1, { short: true });
  assert.ok(!shortLabel.includes('EV_001'));
  assert.ok(shortLabel.includes('Resume'));
});

test('Display Labels: getClaimDisplayLabel produces descriptive claim category labels', (t) => {
  const claim = {
    id: 'CL_001',
    evaluation_id: 'eval_01',
    candidate_profile_id: 'prof_01',
    claim_text: 'Reduced latency by 40%',
    category: 'ACHIEVEMENT',
    status: 'WELL_SUPPORTED'
  };

  const label = getClaimDisplayLabel(claim, 0);
  assert.ok(!label.includes('CL_001'), 'Must not show raw CL_001 ID');
  assert.ok(label.includes('Performance Metric'), 'Must map category to clear description');
});

test('Display Labels: sanitizeUserFacingText neutralizes internal technical ID references in LLM text', (t) => {
  const rawText = 'Candidate is recommended based on EV_001 and EV_002. Skeptic challenged CL_001 in CONF_001.';
  const sanitized = sanitizeUserFacingText(rawText);

  assert.ok(!sanitized.includes('EV_001'), 'EV_001 must be replaced');
  assert.ok(!sanitized.includes('EV_002'), 'EV_002 must be replaced');
  assert.ok(!sanitized.includes('CL_001'), 'CL_001 must be replaced');
  assert.ok(!sanitized.includes('CONF_001'), 'CONF_001 must be replaced');
  assert.ok(sanitized.includes('evidence'), 'Smooth prose must replace technical tokens');
});
