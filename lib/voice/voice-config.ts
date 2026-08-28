import { AgentType } from '../validation/schemas';

export interface PersonaVoiceProfile {
  agentType: AgentType;
  title: string;
  shortName: string;
  pitch: number;
  rate: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  preferredVoices: string[];
  description: string;
}

export const PERSONA_VOICE_CONFIGS: Record<AgentType, PersonaVoiceProfile> = {
  TECHNICAL: {
    agentType: 'TECHNICAL',
    title: 'Technical Depth Analyst',
    shortName: 'Technical Agent',
    pitch: 0.95,
    rate: 1.0,
    color: 'cyan',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/40',
    textColor: 'text-cyan-300',
    preferredVoices: [
      'Google US English',
      'Microsoft David',
      'Microsoft Mark',
      'Daniel',
      'Alex',
      'en-US-Standard-B'
    ],
    description: 'Crisp, structured architectural analysis'
  },
  HR_CULTURE: {
    agentType: 'HR_CULTURE',
    title: 'HR & Culture Analyst',
    shortName: 'HR / Culture',
    pitch: 1.18,
    rate: 1.02,
    color: 'emerald',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
    preferredVoices: [
      'Google UK English Female',
      'Microsoft Zira',
      'Samantha',
      'Victoria',
      'Karen',
      'en-GB-Standard-A'
    ],
    description: 'Empathetic, collaboration & mentorship focus'
  },
  HIRING_MANAGER: {
    agentType: 'HIRING_MANAGER',
    title: 'Hiring Manager',
    shortName: 'Hiring Manager',
    pitch: 0.82,
    rate: 1.05,
    color: 'amber',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    textColor: 'text-amber-300',
    preferredVoices: [
      'Google UK English Male',
      'Microsoft George',
      'Arthur',
      'Oliver',
      'en-GB-Standard-B'
    ],
    description: 'Pragmatic, delivery timeline & team onboarding focus'
  },
  SKEPTIC: {
    agentType: 'SKEPTIC',
    title: 'Skeptic / Red Team',
    shortName: 'Skeptic',
    pitch: 1.05,
    rate: 1.10,
    color: 'rose',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    textColor: 'text-rose-300',
    preferredVoices: [
      'Microsoft Guy',
      'Microsoft Ryan',
      'Fred',
      'Ralph',
      'en-US-Standard-D'
    ],
    description: 'Adversarial cross-examination & claim auditing'
  }
};

/**
 * Builds a collision-free voice map across all 4 personas given available browser voices.
 */
export function buildAgentVoiceMap(availableVoices: SpeechSynthesisVoice[]): Record<AgentType, SpeechSynthesisVoice | null> {
  const result: Record<AgentType, SpeechSynthesisVoice | null> = {
    TECHNICAL: null,
    HR_CULTURE: null,
    HIRING_MANAGER: null,
    SKEPTIC: null
  };

  if (!availableVoices || availableVoices.length === 0) return result;

  const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
  const candidatePool = englishVoices.length > 0 ? englishVoices : availableVoices;
  const usedVoiceNames = new Set<string>();

  const agents: AgentType[] = ['TECHNICAL', 'HR_CULTURE', 'HIRING_MANAGER', 'SKEPTIC'];

  // Pass 1: Try assigning highest priority preferred voice that hasn't been claimed yet
  for (const agent of agents) {
    const profile = PERSONA_VOICE_CONFIGS[agent];
    for (const preferred of profile.preferredVoices) {
      const match = candidatePool.find(
        v => !usedVoiceNames.has(v.name) && v.name.toLowerCase().includes(preferred.toLowerCase())
      );
      if (match) {
        result[agent] = match;
        usedVoiceNames.add(match.name);
        break;
      }
    }
  }

  // Pass 2: For any remaining unassigned agents, assign unused voices from candidatePool
  let poolIndex = 0;
  for (const agent of agents) {
    if (!result[agent]) {
      while (poolIndex < candidatePool.length && usedVoiceNames.has(candidatePool[poolIndex].name)) {
        poolIndex++;
      }
      if (poolIndex < candidatePool.length) {
        result[agent] = candidatePool[poolIndex];
        usedVoiceNames.add(candidatePool[poolIndex].name);
        poolIndex++;
      } else {
        // Fallback: assign modularly
        const personaIdx = agents.indexOf(agent);
        result[agent] = candidatePool[personaIdx % candidatePool.length] || null;
      }
    }
  }

  return result;
}

/**
 * Resolves best available browser voice for an agent persona.
 */
export function resolveAgentVoice(
  agentType: AgentType,
  availableVoices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const map = buildAgentVoiceMap(availableVoices);
  return map[agentType] || null;
}
