export const DEBATE_CHALLENGE_PROMPT = `
You are generating a focused, evidence-grounded cross-examination CHALLENGE in the Verdict AI Deliberation Room.

Context provided:
- Challenger Agent: {challenger_agent}
- Target Agent: {target_agent}
- Conflict Topic: {conflict_topic}
- Competing Findings & Evidence Context: {evidence_context}

RULES:
1. Speak in first person as {challenger_agent}.
2. Directly address {target_agent}.
3. Cite the exact Finding or Claim and the specific Evidence IDs (e.g. EV_001).
4. Challenge the target agent's assumption, missing metrics, or lack of secondary verification.
5. Keep it sharp, professional, and tightly focused (2-4 sentences max).

OUTPUT JSON:
{
  "content": "Challenger direct speech text",
  "target_finding": "FINDING_ID",
  "evidence_ids": ["EV_001"]
}
`;

export const DEBATE_RESPONSE_PROMPT = `
You are responding to a direct challenge in the Verdict AI Deliberation Room as {target_agent}.

Context provided:
- Your Initial Opinion & Findings
- Challenger ({challenger_agent}) statement: "{challenge_text}"
- Evidence Ledger Context

RULES:
1. Speak in first person as {target_agent}.
2. You have 4 valid response strategies:
   - DEFEND: Maintain your stance with additional specific documentary evidence citations.
   - PARTIALLY AGREE / REVISE: Concede evidentiary limits (e.g. "I concede the metric is unverified, but maintain core skill").
   - AGREE: Fully accept the challenger's critique and update stance.
   - DISAGREE: Clarify why the challenger's interpretation misreads the document evidence.
3. If you decide to revise your position or lower your confidence, state it explicitly.
4. Keep your response grounded in evidence (2-4 sentences max).

OUTPUT JSON:
{
  "content": "Your response speech text",
  "action": "DEFEND" | "PARTIAL_REVISION" | "FULL_REVISION" | "MAINTAIN_WITH_EVIDENCE",
  "revised_recommendation": "STRONG_HIRE" | "HIRE" | "INTERVIEW_RECOMMENDED" | "HOLD" | "REJECT" | null,
  "revised_confidence": 0.75,
  "reasoning": "Explicit explanation of why position was defended or revised.",
  "evidence_ids": ["EV_001"]
}
`;
