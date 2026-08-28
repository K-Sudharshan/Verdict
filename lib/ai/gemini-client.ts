import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateStructuredParams<T> {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

// ─────────────────────────────────────────────────────────────
// Server-side only key resolver. Never called from the browser.
// ─────────────────────────────────────────────────────────────
function getServerSideApiKey(): string | null {
  const raw = process.env.GEMINI_API_KEY;
  if (!raw) return null;
  const trimmed = raw.trim();
  if (
    !trimmed ||
    trimmed.length < 10 ||
    trimmed.startsWith('PASTE_') ||
    trimmed === 'your_gemini_api_key_here'
  ) {
    return null;
  }
  return trimmed;
}

export class GeminiAIClient {
  /**
   * Returns true only when a valid key is present in the environment.
   * Safe to call from server code to decide between REAL and DEMO mode.
   */
  public static isConfigured(): boolean {
    return getServerSideApiKey() !== null;
  }

  /**
   * Attempt a single Gemini call. Returns structured result.
   * Never falls back silently — caller decides what to do on failure.
   */
  public static async generateJSON<T>(
    params: GenerateStructuredParams<T>
  ): Promise<{ success: boolean; data: T | null; error?: string }> {
    const key = getServerSideApiKey();
    if (!key) {
      return { success: false, data: null, error: 'NO_API_KEY' };
    }

    try {
      const genai = new GoogleGenerativeAI(key);
      const model = genai.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: params.temperature ?? 0.2,
          responseMimeType: 'application/json'
        },
        systemInstruction: params.systemPrompt
      });

      const result = await model.generateContent(params.userPrompt);
      const text = result.response.text();

      // Strip optional markdown fences
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(cleaned) as T;
      return { success: true, data: parsed };
    } catch (err: any) {
      // Safe log: never include key or raw candidate text
      const safeMsg = String(err?.message || 'GEMINI_ERROR').slice(0, 200);
      console.warn('[Gemini] Call failed:', safeMsg);
      return { success: false, data: null, error: 'LLM_CALL_FAILED' };
    }
  }

  /**
   * Health-check: make one real, harmless Gemini call.
   * Returns only success/failure and model name — never the key.
   */
  public static async healthCheck(): Promise<{
    ok: boolean;
    model: string;
    error?: string;
  }> {
    const key = getServerSideApiKey();
    if (!key) {
      return { ok: false, model: 'none', error: 'NO_API_KEY_CONFIGURED' };
    }
    try {
      const genai = new GoogleGenerativeAI(key);
      const model = genai.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { temperature: 0, responseMimeType: 'application/json' }
      });
      const result = await model.generateContent('Reply with exactly: {"status":"ok"}');
      const text = result.response.text().trim();
      const parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim());
      if (parsed.status === 'ok') {
        return { ok: true, model: 'gemini-2.0-flash' };
      }
      return { ok: false, model: 'gemini-2.0-flash', error: 'UNEXPECTED_RESPONSE' };
    } catch (err: any) {
      const safeMsg = String(err?.message || 'HEALTH_CHECK_FAILED').slice(0, 200);
      return { ok: false, model: 'gemini-2.0-flash', error: safeMsg };
    }
  }
}
