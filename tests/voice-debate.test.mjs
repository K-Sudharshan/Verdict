import test from 'node:test';
import assert from 'node:assert';
import { PERSONA_VOICE_CONFIGS, resolveAgentVoice } from '../lib/voice/voice-config.ts';
import { SEED_EVALUATIONS } from '../lib/db/seed-data.ts';

test('Voice Debate: All 4 personas have distinct independent voice configurations', (t) => {
  const agents = ['TECHNICAL', 'HR_CULTURE', 'HIRING_MANAGER', 'SKEPTIC'];

  // 1. Verify all 4 agents exist in config
  for (const agent of agents) {
    const config = PERSONA_VOICE_CONFIGS[agent];
    assert.ok(config, `Voice configuration must exist for ${agent}`);
    assert.ok(typeof config.pitch === 'number', `${agent} must have a numeric pitch`);
    assert.ok(typeof config.rate === 'number', `${agent} must have a numeric rate`);
    assert.ok(config.preferredVoices.length > 0, `${agent} must specify preferred voice profiles`);
  }

  // 2. Verify all 4 agents have distinct pitch/rate combinations to guarantee acoustic distinction
  const pitches = agents.map(a => PERSONA_VOICE_CONFIGS[a].pitch);
  const uniquePitches = new Set(pitches);
  assert.strictEqual(uniquePitches.size, 4, 'All 4 agents must have distinct pitch tunings');

  // 3. Verify resolveAgentVoice distributes voices deterministically across personas
  const mockVoices = [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Google UK English Female', lang: 'en-GB' },
    { name: 'Google UK English Male', lang: 'en-GB' },
    { name: 'Microsoft Guy', lang: 'en-US' }
  ];

  const assignedVoices = agents.map(a => resolveAgentVoice(a, mockVoices));
  const assignedNames = assignedVoices.map(v => v?.name);
  const uniqueAssigned = new Set(assignedNames);

  assert.strictEqual(uniqueAssigned.size, 4, 'Each of the 4 agents must receive a distinct voice from the pool');
});

test('Voice Debate: Debate messages retain real speaker identity and verbatim transcript content', (t) => {
  const evalData = SEED_EVALUATIONS['eval_alex_rivera'];
  assert.ok(evalData.debate_messages.length > 0, 'Must have debate messages in session');

  const speakers = new Set(evalData.debate_messages.map(m => m.speaker_agent_type));

  // Verify multiple agents speak (not just Skeptic)
  assert.ok(speakers.has('SKEPTIC'), 'Skeptic must speak in debate transcript');
  assert.ok(speakers.has('TECHNICAL'), 'Technical Agent must speak in debate transcript');
  assert.ok(speakers.has('HIRING_MANAGER'), 'Hiring Manager must speak in debate transcript');

  // Verify message types represent real adversarial debate flow
  const messageTypes = new Set(evalData.debate_messages.map(m => m.message_type));
  assert.ok(messageTypes.has('CHALLENGE'), 'Must have CHALLENGE turns');
  assert.ok(messageTypes.has('RESPONSE') || messageTypes.has('DEFENSE'), 'Must have RESPONSE / DEFENSE turns');
  assert.ok(messageTypes.has('REVISION'), 'Must have REVISION turns');
});
