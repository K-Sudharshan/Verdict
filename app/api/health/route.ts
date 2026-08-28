import { NextResponse } from 'next/server';
import { GeminiAIClient } from '@/lib/ai/gemini-client';

/**
 * GET /api/health/gemini
 * Development diagnostic — makes one real harmless Gemini request.
 * Returns only: success, model, and any error message.
 * Never returns the API key or any candidate data.
 */
export async function GET() {
  const keyPresent = GeminiAIClient.isConfigured();

  if (!keyPresent) {
    return NextResponse.json({
      ok: false,
      configured: false,
      model: 'none',
      mode: 'DEMO',
      error: 'GEMINI_API_KEY not set in environment. Running in DEMO mode.'
    });
  }

  const result = await GeminiAIClient.healthCheck();

  return NextResponse.json({
    ok: result.ok,
    configured: true,
    model: result.model,
    mode: result.ok ? 'REAL' : 'DEMO',
    error: result.error || null
  });
}
