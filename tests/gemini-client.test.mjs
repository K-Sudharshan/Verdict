import test from 'node:test';
import assert from 'node:assert';
import { GeminiAIClient } from '../lib/ai/gemini-client.ts';

test('Gemini Client: Safe initialization and server-side key checking', async (t) => {
  // Test 1: isConfigured() returns a boolean
  const configured = GeminiAIClient.isConfigured();
  assert.strictEqual(typeof configured, 'boolean', 'isConfigured() must return a boolean');

  // Test 2: generateJSON handles missing/invalid key gracefully without crashing
  const res = await GeminiAIClient.generateJSON({
    systemPrompt: 'You are a tester.',
    userPrompt: 'Output {"test": true}'
  });
  assert.ok(typeof res.success === 'boolean', 'generateJSON must return a result object with boolean success');

  // Test 3: healthCheck returns structured status
  const health = await GeminiAIClient.healthCheck();
  assert.ok('ok' in health, 'healthCheck result must contain ok');
  assert.ok('model' in health, 'healthCheck result must contain model');
  assert.ok(typeof health.model === 'string', 'model must be a string');
});
