# PRD.md
## Verdict AI — Multi-Agent Candidate Intelligence & Hiring Debate System
### Product Requirements Document

> This document defines the product: the problem, the users, the experience, and the requirements. It intentionally does not define database schemas, API contracts, or code architecture — those live in README.md, the system's technical source of truth. This PRD must be read alongside README.md, not in place of it.

---

# 1. Product Overview

Verdict AI is an evidence-first, multi-agent AI hiring intelligence platform. A recruiter or hiring team uploads a candidate's resume, academic transcript, and optionally a job description and an interview or assessment transcript. The system builds a structured Candidate Profile, then evaluates that candidate through four independent AI personas — a Technical Agent, an HR/Culture Agent, a Hiring Manager Agent, and a Skeptic/Red Team Agent — each of whom reasons privately before any of them are allowed to see one another's conclusions.

Once all four independent evaluations are complete, the agents enter a structured debate in which they challenge, defend, and sometimes revise their positions. A separate Final Deliberation stage then weighs the evidence, the agents' confidence, and the outcome of the debate to produce a final hiring recommendation. Critically, this recommendation is never a simple average of four scores — it is a reasoned judgment that explains itself.

The product's job is to turn a candidate evaluation into something a human can trust, interrogate, and act on — not a black-box score, and not four disconnected opinions bolted together.

---

# 2. Problem Statement

Traditional resume screening and today's generation of "AI resume scoring" tools share a common set of failures:

- **Black-box decisions.** A candidate receives a score or a pass/fail verdict with no visibility into how it was reached.
- **Unsupported AI conclusions.** Many AI screening tools generate confident-sounding judgments ("strong technical fit") with no link back to the actual evidence in the candidate's documents.
- **Resume exaggeration goes unchallenged.** Buzzwords, inflated metrics, and vague claims ("led cross-functional initiatives") are taken at face value rather than tested.
- **Single-perspective evaluation.** A resume screener typically applies one lens — usually a keyword or skills match — and misses the fact that real hiring decisions involve competing viewpoints (technical fit, cultural fit, business risk, and healthy skepticism).
- **No structured disagreement.** Real hiring panels argue. Automated tools don't; they produce a single flattened verdict with no record of where reasonable evaluators might differ.
- **Simple score averaging.** Where multiple signals exist, most tools simply average them, which quietly discards the most important information: *why* two evaluators disagreed and which of them was right.

The result is a category of tools that recruiters don't fully trust, can't explain to candidates or stakeholders, and can't use as a genuine aid to judgment rather than a replacement for it.

---

# 3. Product Vision

Verdict AI should feel like sitting in on an AI-powered hiring panel — not chatting with a resume-scoring bot. The long-term vision is a product where a hiring team can upload a candidate, watch four distinct evaluators reason independently, watch them argue over specific evidence, and walk away with a recommendation that is transparent, contestable, and grounded in the candidate's actual documents. Every claim the system makes about a candidate should be traceable to a source. Every disagreement should be visible rather than smoothed over. The product should make hiring decisions more defensible, not just faster.

---

# 4. Target Users

- **Recruiters** — need to quickly triage candidates, understand strengths and risks at a glance, and generate targeted interview questions without having to independently re-derive them from the raw resume.
- **Hiring managers** — need a business-relevant judgment ("should I invest time interviewing this person?") plus enough visibility into the reasoning to defend or override the recommendation.
- **Startup founders** — often act as their own recruiting and hiring-manager function; need a fast, trustworthy second opinion that surfaces risk without requiring a full panel interview process.
- **HR teams** — need consistency and auditability across candidate evaluations, plus assurance that the evaluation process avoids protected-attribute judgments and stays evidence-grounded.

---

# 5. User Problems / Pain Points

- It's hard to tell, from a resume alone, which claims are real and which are inflated.
- Screening a large candidate pool consistently and fairly is time-consuming.
- Existing AI scoring tools produce a verdict with no way to interrogate *why*.
- Hiring panels naturally surface disagreement, but that disagreement is often lost or never actually discussed in ad hoc screening processes.
- Preparing good, targeted interview questions that probe a candidate's weakest or least-verified claims takes real effort.
- Decision-makers need to explain and defend hiring recommendations to other stakeholders, and a single opaque score doesn't support that.

---

# 6. Core Value Proposition

Verdict AI is not a resume scoring tool, an Applicant Tracking System, or a generic AI recruitment assistant.

- **Resume scoring tools** produce a single number from keyword or embedding similarity, with no reasoning trail and no adversarial checking of claims.
- **Applicant Tracking Systems** manage pipeline and workflow but do not evaluate candidate substance.
- **Generic AI recruitment tools** typically wrap a single LLM call in a chat interface, producing one opinion that reads as authoritative but is unsupported and unchallenged.

Verdict AI's differentiator is the full pipeline: **independent analysis → evidence-backed opinions → agent debate → reasoned final decision.** Each stage adds a layer of rigor that single-pass AI tools skip entirely, and the evidence ledger keeps every stage honest and auditable.

---

# 7. Product Principles

1. **Evidence before opinion.** No conclusion is allowed to stand without a link to a specific piece of candidate-provided evidence.
2. **Independent reasoning before collaboration.** Each agent must form its own view before being exposed to any other agent's view, so that group opinions don't collapse into groupthink.
3. **Disagreement is valuable.** A visible disagreement between agents is a feature, not a bug — it tells the user exactly where to focus verification effort.
4. **Explainability over black-box scoring.** Every number, label, or recommendation the product shows must be explainable in plain language and traceable to its source.
5. **Final decisions require deliberation.** A recommendation is the output of reasoning about evidence and disagreement, never an arithmetic shortcut.
6. **Human oversight remains important.** Verdict AI produces a recommendation and a rationale, not a final hiring decision — it is a decision-support tool, and the interface should reinforce that framing throughout.

---

# 8. Primary User Journey

1. The user uploads a candidate's resume and transcript, and optionally a job description and an interview/assessment transcript.
2. The system processes the documents and shows real-time progress.
3. A structured Candidate Profile is created, extracting skills, education, experience, projects, and evaluable claims, each linked to source evidence.
4. Four agents — Technical, HR/Culture, Hiring Manager, and Skeptic — independently evaluate the candidate. Each runs as a separate call and cannot see the others' outputs.
5. The user can view each agent's independent evaluation, including strengths, concerns, and evidence.
6. The system identifies meaningful disagreements between agents (contradictory recommendations, or claims one agent finds strong and another finds weak).
7. The agents enter a structured, targeted debate — cross-examining each other's specific findings rather than restating their opinions.
8. Agents may defend, agree, partially agree, or revise their position in response to a challenge; each disagreement is marked resolved, partially resolved, or unresolved.
9. A separate Final Deliberation stage reviews all independent opinions, the debate transcript, and the resolution status of each disagreement.
10. A Final Report is generated: recommendation, confidence, strengths, concerns, evidence, agent disagreements, unresolved issues, claims requiring verification, and suggested interview questions.
11. The user reviews the report, can trace any statement back to its source evidence, inspects the Claim Confidence / Risk Map, and (optionally) listens to a voice rendition of the debate.

---

# 9. Functional Requirements

## 9.1 Candidate Document Upload

**Description.** The entry point of the product: the user provides the raw materials the entire evaluation is built on.

**User value.** A fast, low-friction way to get a candidate's resume and supporting materials into the system without needing to manually structure or summarize anything.

**Functional requirements.**
- Accept a resume (required) and academic transcript (required).
- Accept an optional job description / target role.
- Accept an optional interview or assessment transcript.
- Support common document formats (e.g., PDF, DOCX, plain text) for each upload slot.
- Show clear per-file upload status and validation errors (wrong format, unreadable file, file too large).

**Expected behavior.** The user can start an evaluation with just a resume and transcript; job description and interview transcript enrich the evaluation when present but are never required.

**Acceptance criteria.**
- A candidate evaluation can be created from a resume and transcript alone.
- Invalid or unreadable files produce a clear, specific error rather than a silent failure or a generic error.
- The user can see which documents are attached to a given candidate session at any time.

## 9.2 Candidate Profile Builder

**Description.** Converts raw uploaded documents into the single structured, normalized representation of the candidate that all downstream agents share.

**User value.** Gives the user (and every agent) one consistent, structured view of the candidate instead of four different readings of raw text.

**Functional requirements.**
- Extract identity/education details, skills (languages, frameworks, tools, cloud, databases, other), and experience (jobs, internships, freelance, leadership, open-source, hackathons, projects).
- Extract discrete, evaluable **claims** the candidate makes (e.g., "improved API response time by 40%"), each linked to its source document and an exact supporting quote.
- Produce one Candidate Profile per evaluation that is the sole shared source of candidate facts used by every agent and by the debate/deliberation stages.

**Expected behavior.** The user can view the generated Candidate Profile as a structured summary before or alongside the agent evaluations, and can see which document each fact or claim came from.

**Acceptance criteria.**
- Every extracted claim has an identifiable source document and quote.
- The Candidate Profile is generated once per set of documents and reused by all agents rather than re-derived independently by each one.
- If a document is missing required sections (e.g., no transcript), the profile builder degrades gracefully and clearly indicates which sections could not be populated.

## 9.3 Evidence Ledger

**Description.** The centralized record connecting every claim, quote, and agent conclusion back to its source — the backbone of the product's explainability.

**User value.** Lets the user click any statement in the product and trace it down to the exact sentence in the candidate's resume or transcript that supports it.

**Functional requirements.**
- Every agent finding, strength, or concern must reference one or more entries in the Evidence Ledger.
- Every ledger entry must resolve to a source document, an exact quote, and (where applicable) a claim ID from the Candidate Profile.
- The final report's statements must remain clickable/inspectable back to their ledger entries.

**Expected behavior.** Clicking a conclusion anywhere in the UI shows the chain: Conclusion → Supporting evidence → Exact quote → Source document.

**Acceptance criteria.**
- No major finding in the product is presented without at least one traceable evidence reference.
- A user can, for any final-report statement, reach the original quote within one or two interactions.

## 9.4 Independent AI Agent Evaluation

**Description.** The stage where four distinct personas independently assess the candidate using only the shared Candidate Profile and Evidence Ledger.

**User value.** Produces four genuinely different perspectives instead of one opinion dressed up as four, giving the user a more complete and trustworthy picture.

**Functional requirements.**
- At least four agents: Technical, HR/Culture, Hiring Manager, Skeptic/Red Team.
- Each agent evaluation must be a separate, independent execution (see Section 10 for isolation rules).
- Each agent produces a structured recommendation, confidence level, strengths, concerns, and evidence references.

**Expected behavior.** The user sees per-agent status (in progress / complete) and, once complete, each agent's full independent opinion before any debate occurs.

**Acceptance criteria.**
- All four independent evaluations complete and are individually viewable before debate begins.
- No independent evaluation shows any awareness of another agent's conclusion.

## 9.5 Technical Agent

**Description.** Assesses whether the candidate has genuine technical depth relevant to the target role.

**User value.** Distinguishes candidates who can demonstrably do the technical work from those who merely list relevant keywords.

**Functional requirements.** Evaluate technical skills, project complexity, depth versus buzzword usage, evidence of hands-on work, relevance to job requirements, academic foundation, and ability to explain technical decisions. Must explicitly flag skills with insufficient evidence rather than assuming competence.

**Expected behavior.** Produces a recommendation (Strong Yes / Yes / Maybe / No), confidence, evidence-backed strengths and concerns, and follow-up questions to investigate.

**Acceptance criteria.** Every technical strength or concern cites specific evidence; any skill without supporting evidence is explicitly marked as unverified rather than silently credited.

## 9.6 HR / Culture Agent

**Description.** Assesses communication, teamwork, ownership, honesty, professional maturity, and consistency across the candidate's documents.

**User value.** Surfaces cultural and interpersonal signal that a purely technical read would miss, without resorting to unsupported personality judgments.

**Functional requirements.** Evaluate communication quality, collaboration, leadership evidence, ownership, consistency between resume and any interview/transcript material. Must not make protected-attribute judgments or infer personality traits without evidence; every conclusion must connect to evidence.

**Expected behavior.** Produces structured strengths/concerns tied to evidence, with explicit acknowledgment where the available documents don't support a firm read on a given trait.

**Acceptance criteria.** No conclusion in this agent's output relies on inference alone without a cited evidentiary basis; no protected-attribute reasoning appears anywhere in the output.

## 9.7 Hiring Manager Agent

**Description.** Makes the practical, business-oriented call: is this candidate worth the time investment of an interview or hire, for this specific role?

**User value.** Adds a business-risk lens that a purely technical or cultural read doesn't provide — a technically strong candidate can still be a weak role fit.

**Functional requirements.** Evaluate job fit, immediate usefulness, growth potential, risk versus upside, missing requirements, and produce an interview/hire recommendation (Strong Hire / Hire / Interview First / Hold / Reject).

**Expected behavior.** This agent's reasoning should visibly differ in emphasis from the Technical Agent's — it weighs role context and business risk rather than technical depth alone.

**Acceptance criteria.** The agent's recommendation is grounded in role-relevant evidence, and its reasoning demonstrably differs in framing from the Technical Agent's (not a restatement of the same conclusion).

## 9.8 Skeptic / Red Team Agent

**Description.** Treats every impressive claim as unproven until evidence supports it; hunts for contradictions, inflation, and unverifiable metrics.

**User value.** Provides the adversarial check that prevents the system (and the user) from taking resume claims at face value.

**Functional requirements.** Search for contradictions, skill inflation, unexplained metrics, timeline inconsistencies, technology name-dropping, and mismatches between stated skills and demonstrated work. Must identify verification risk rather than issue blanket rejections.

**Expected behavior.** Produces a list of claims with a "weakly supported / well supported / contradicted" style assessment and a stated reason for each, tied to evidence IDs.

**Acceptance criteria.** The Skeptic's output never simply rejects the candidate outright; every flagged claim includes a specific reason and evidence reference, and the agent's role is framed as risk identification, not disqualification.

## 9.9 Conflict Detection

**Description.** Identifies where independent agent opinions meaningfully disagree, so the debate stage has something real to work with.

**User value.** Ensures the debate focuses on genuine, consequential disagreements rather than staging a generic conversation.

**Functional requirements.** Detect contradictory recommendations, high-confidence disagreements, claims rated strong by one agent and weak by another, and major unresolved concerns raised by any agent.

**Expected behavior.** Detected conflicts become the priority topics for the debate stage; trivial or non-substantive differences are not elevated to debate topics.

**Acceptance criteria.** At least one genuine, evidence-relevant conflict is surfaced whenever agent opinions meaningfully diverge; the system does not fabricate conflicts when agents substantially agree.

## 9.10 Adaptive Cross-Examination

**Description.** The mechanism that turns detected conflicts into specific, targeted challenges between agents rather than a generic back-and-forth.

**User value.** Produces a debate that actually interrogates the candidate's weakest points instead of restating four opinions side by side.

**Functional requirements.** For each priority conflict, generate a challenge that names the target agent, the specific finding being challenged, the substance of the challenge, and the evidence in question. The targeted agent must respond by defending, agreeing, partially agreeing, or revising its conclusion.

**Expected behavior.** The user can see, for each debated point, who challenged whom, on what specific finding, and how the challenged agent responded.

**Acceptance criteria.** Every challenge references a specific finding and specific evidence, not a vague restatement of disagreement; every challenge receives a response from the targeted agent.

## 9.11 Agent Position Revision

**Description.** Allows an agent to change or partially change its position in light of a challenge, rather than being locked into its first-pass conclusion.

**User value.** Makes the debate meaningful — the user can see reasoning actually update in response to counter-evidence, which builds trust in the process.

**Functional requirements.** An agent's response to a challenge must be one of: defend as-is, agree, partially agree, or revise. Revisions must be recorded alongside the original position so the change is visible, not silently overwritten.

**Expected behavior.** The UI shows the original position and, where changed, the revised position side by side with the reasoning for the change.

**Acceptance criteria.** At least one position revision or partial revision occurs whenever a challenge is well supported by evidence; the history of the change remains visible to the user.

## 9.12 Final Deliberation

**Description.** A separate reasoning stage that weighs everything produced so far — independent opinions, the debate, and resolution outcomes — into a final recommendation.

**User value.** Produces a recommendation the user can trust precisely because it isn't a shortcut average; it explains what mattered and why.

**Functional requirements.** Must consider strength of evidence, role relevance, agent confidence, severity of concerns, debate outcomes, revised positions, and unresolved disagreements. Must never be computed by averaging agent scores. Must produce a written rationale explaining which evidence or concerns most influenced the outcome.

**Expected behavior.** The user reads a final recommendation accompanied by a clear explanation, not just a label or number.

**Acceptance criteria.** The final recommendation is not reproducible by averaging the four agents' scores; the rationale explicitly references specific evidence and specific unresolved or resolved disagreements.

## 9.13 Final Candidate Report

**Description.** The user-facing summary of the entire evaluation: the decision dossier.

**User value.** A single place to see the recommendation, the reasoning behind it, and everything needed to plan next steps (interview questions, verification items).

**Functional requirements.** Must include: final recommendation, confidence level (with a plain-language explanation of what confidence means), key strengths (with evidence and supporting agents), major concerns (with evidence and raising agent), agent disagreements (with resolution status), unresolved issues, claims requiring verification, and suggested interview questions.

**Expected behavior.** Every statement in the report is traceable to evidence via the Evidence Ledger; the report reads as a coherent narrative, not a dump of raw agent output.

**Acceptance criteria.** All required report sections are present and populated for every completed evaluation; every strength and concern is evidence-linked.

## 9.14 Candidate Claim Confidence / Risk Map

**Description.** A visual way to inspect individual candidate claims and their trust level.

**User value.** Lets the user quickly see which specific claims are safe to rely on and which need to be probed in an interview.

**Functional requirements.** Each major claim is categorized as Verified, Well Supported, Partially Supported, Unverified, or Contradicted. Each claim node should connect to its resume/transcript evidence, the agent support and challenges it received, and its final status.

**Expected behavior.** The user can scan the map and immediately identify high-risk claims worth interview follow-up.

**Acceptance criteria.** Every claim tracked through the evaluation appears on the map with a status and is linked back to its evidence and any agent disagreement about it.

## 9.15 Interview Verification Questions

**Description.** Automatically generated, targeted questions derived from the candidate's weakest or most disputed claims.

**User value.** Saves the interviewer from having to manually reconstruct which claims need probing; turns the evaluation into direct interview prep.

**Functional requirements.** Generate questions specifically tied to unverified, partially supported, or contradicted claims and to unresolved agent disagreements — not generic interview questions.

**Expected behavior.** Each suggested question is traceable to the specific claim or disagreement that prompted it.

**Acceptance criteria.** Every generated question references an identifiable claim or disagreement from the evaluation; generic, evaluation-independent questions are not presented as if they were tailored.

## 9.16 Optional Voice Hiring Room

**Description.** An optional feature allowing the user to listen to the validated debate as a controlled, multi-voice audio session.

**User value.** Makes the debate more accessible and engaging to review, especially for users who prefer listening to a discussion over reading a transcript.

**Functional requirements.** Must be generated strictly from the already-validated structured debate transcript — it must not introduce new evidence or reasoning. Each persona should have a distinct, neutral voice. The user must be able to listen, read a full text transcript in parallel, identify the current speaker, jump to major disagreements, and jump to the final decision.

**Expected behavior.** The audio session is a faithful narration of the validated debate, not a live, independently-generated conversation.

**Acceptance criteria.** A full text transcript is always available alongside the audio; the audio content matches the validated debate transcript with no invented content; the user can navigate directly to disagreement points and the final decision.

---

# 10. Agent Independence Requirements

This is one of the most important requirements in the entire product and must not be diluted.

- Every initial agent analysis (Technical, HR/Culture, Hiring Manager, Skeptic) must execute as a **separate, independent call**.
- Before the debate stage begins, **no agent may access another agent's conclusions, reasoning, scores, recommendations, or concerns.**
- Independent agents may only receive: the Candidate Profile, the Evidence Ledger, the job description (if provided), and their own persona instructions. Nothing else.
- The system must preserve each agent's independent output, unmodified, before debate begins — these are the "first opinions" and must remain inspectable even after debate produces revised positions.
- Only after **all four** independent evaluations are complete may agents be given access to each other's outputs, and only for the purpose of the structured debate.
- The product must never allow one independent agent's output to be sequentially fed into another independent agent's evaluation. Independence means simultaneous or otherwise non-sequential execution with no shared context beyond the Candidate Profile and Evidence Ledger.

This requirement exists because the entire value proposition of the product — genuinely independent perspectives that then argue from first principles — collapses if agents anchor on each other's conclusions before forming their own.

---

# 11. Evidence and Explainability Requirements

- Every major conclusion (strength, concern, recommendation) produced by any agent, the debate engine, or the Final Deliberator must be backed by at least one specific piece of evidence.
- Evidence must originate from the candidate's own uploaded documents — never from general assumptions about "typical candidates" or role stereotypes.
- The system must avoid presenting unsupported assumptions as fact; where evidence is absent, agents must say so explicitly (e.g., "insufficient evidence to verify this skill") rather than filling the gap with inference.
- The system must distinguish clearly, in its output, between evidence (a direct quote or extracted fact), inference (a reasoned conclusion drawn from evidence), and uncertainty (an acknowledged gap in available information).
- Claims with weak or absent supporting evidence must be visibly marked as such throughout the product — in agent output, in the risk map, and in the final report.
- Every conclusion presented to the user must be traceable back to its source evidence through the Evidence Ledger, in no more than a couple of interactions.

---

# 12. Debate Requirements

Showing four independent opinions side by side does **not** constitute a debate. A valid debate requires actual interaction between agents.

Requirements:

- **Direct responses.** At least one agent must directly respond to a specific statement made by another agent — not a generic restatement of its own view.
- **Challenges.** Challenges must target a specific finding and cite the evidence in question, not raise a vague objection.
- **Agreement and disagreement.** Agents must be able to explicitly agree, disagree, or partially agree with another agent's specific point.
- **Evidence-based defense.** When an agent maintains its position under challenge, it must do so by citing evidence, not by simply repeating its original claim.
- **Position changes.** Agents must be capable of fully or partially revising their position when a challenge is well supported.
- **Resolved and unresolved conflicts.** Every detected conflict must end the debate stage marked Resolved, Partially Resolved, or Unresolved, and unresolved conflicts must be surfaced prominently to the user rather than quietly dropped.

---

# 13. Final Decision Requirements

- The system must never compute the final recommendation by averaging agent scores or confidence levels.
- The final decision must be produced by a distinct deliberation/reasoning stage that considers, at minimum: strength of evidence, role relevance, each agent's confidence, severity of concerns raised, the outcome of the debate, any revised positions, unresolved disagreements, and the overall balance of candidate upside versus verification risk.
- The final output must include a written rationale explaining which specific evidence or concerns most influenced the recommendation — the "why," not just the "what."
- Unresolved disagreements must always be exposed to the user in the final report, never silently absorbed into a single confident-sounding verdict.

---

# 14. Recommendation Categories

- **Strong Hire** — Evidence strongly and consistently supports the candidate across technical, cultural, and role-fit dimensions, with no significant unresolved concerns.
- **Hire** — Evidence supports the candidate overall; any concerns are minor or well-mitigated by other evidence.
- **Interview Recommended** — The candidate shows real promise, but key claims or concerns remain unverified and should be explored directly with the candidate before a hire decision.
- **Hold** — Meaningful concerns or unresolved disagreements exist that make an immediate decision premature; more information (interview, additional documents) is needed.
- **Reject** — Evidence indicates a poor fit for the role, or significant concerns (e.g., contradictions, major unverifiable claims) outweigh the candidate's demonstrated strengths.

---

# 15. Confidence Model

- **High** — The available evidence is consistent, sufficiently detailed, and directly supports the recommendation; agent disagreement, if any, was resolved during debate.
- **Medium** — The evidence generally supports the recommendation, but some claims remain partially supported or some disagreement between agents was only partially resolved.
- **Low** — The evidence is sparse, inconsistent, or significant disagreements between agents remain unresolved; the recommendation should be treated as provisional.

Confidence describes **confidence in the recommendation given the available evidence** — it is not, and must never be presented as, a prediction or guarantee of the candidate's future job performance. This distinction should be stated explicitly in the UI wherever confidence is shown.

---

# 16. User Experience Requirements

The product must not look or feel like a generic chatbot, a basic AI dashboard, or four static scorecards. It should feel like an **interactive AI hiring intelligence room**.

Key experience areas:

- **Candidate overview** — a clear, structured summary of who the candidate is, built from the Candidate Profile.
- **Agent workspace** — four distinct agent panels showing status and, once complete, each agent's independent evaluation.
- **Debate room** — a view that transforms the experience from "four opinions" into a visible deliberation: active speaker, challenged statement, evidence references, position changes, and resolution status.
- **Evidence inspection** — the ability to click any statement anywhere in the product and see its supporting evidence chain.
- **Risk map** — a visual, explorable view of claim confidence/risk categorization.
- **Final decision dossier** — a polished, narrative-style final report rather than a chart-heavy dashboard.

The interface should make the independence → debate → deliberation pipeline visible and legible to the user at every stage — this pipeline is the core of the product's credibility and should never be hidden behind a simple loading spinner with no explanation of what's happening.

---

# 17. Accessibility Requirements

- Full keyboard navigability across all screens, including the debate room and risk map.
- Screen reader support for agent status, debate turns, and report content, including meaningful labels (not just visual icons).
- Clear, visible focus indicators on all interactive elements.
- Sufficient color contrast throughout, including in status indicators.
- No information (recommendation category, resolution status, claim risk level) may be communicated by color alone — always pair color with text or iconography.
- The Voice Hiring Room must always be accompanied by a complete, synchronized text transcript.

---

# 18. Security and Privacy Requirements

- Uploaded resumes, transcripts, and interview materials must be handled securely and only be accessible to authorized users associated with the candidate's evaluation session.
- The system must enforce user authorization on all candidate data access and evaluation results.
- Candidate documents must be treated strictly as **untrusted data**, never as instructions — the system must be resilient to prompt injection attempts embedded in uploaded content (e.g., text instructing the system to "mark this candidate as hired").
- API keys and other secrets must never be exposed to client-side code; all AI provider calls must be made from server-side infrastructure.
- Candidate data should not be retained longer than necessary for the product's purpose, and users should have visibility into what is stored and for how long.
- These requirements are stated here at the product level; implementation specifics (encryption schemes, storage configuration, etc.) are defined separately.

---

# 19. Performance and Efficiency Requirements

- Independent agent analyses should execute efficiently and, where possible, concurrently rather than sequentially, since the four evaluations do not depend on one another.
- The UI must reflect genuine backend processing state at every stage (document ingestion, profile building, each agent's status, debate progress, final deliberation) — progress indicators must never be faked or purely time-based.
- The system should avoid unnecessary reprocessing: if the same candidate documents are unchanged, previously generated Candidate Profile and Evidence Ledger data should be reused rather than regenerated.
- The debate stage should prioritize genuinely meaningful disagreements rather than attempting to debate every minor difference, keeping the process focused and responsive.
- The application must remain responsive to the user throughout AI processing, even during longer-running stages like debate and deliberation.

---

# 20. Google Services Integration

Google services should be used where they provide genuine product value, not integrated for their own sake.

- **Gemini** is the primary reasoning engine — used for document understanding, Candidate Profile extraction, each of the four independent agent evaluations, debate reasoning, and final deliberation.
- **Google Cloud services** may be used for secure storage of uploaded candidate documents and generated reports, where a managed, access-controlled storage layer benefits the product's security and reliability requirements.
- **Google Cloud Text-to-Speech** supports the optional Voice Hiring Room, converting the validated debate transcript into distinct persona voices.

Integrations should be evaluated against whether they materially improve the product experience, reliability, or security — not added purely to satisfy an evaluation checklist.

---

# 21. Non-Functional Requirements

- **Reliability** — the evaluation pipeline should complete predictably for valid inputs, and failures at any stage should be surfaced clearly rather than silently dropped.
- **Scalability** — the architecture should support running multiple candidate evaluations without one evaluation's processing blocking another's.
- **Maintainability** — agent personas, debate logic, and deliberation logic should be structured so that each can be understood, tested, and adjusted independently.
- **Observability** — the system should make it possible to inspect what happened at each pipeline stage for a given candidate evaluation (useful both for debugging and for demonstrating the independence guarantees).
- **Security** — as detailed in Section 18.
- **Accessibility** — as detailed in Section 17.
- **Testability** — the architecture should support automated verification of the product's most important guarantees, especially agent isolation and non-averaged final decisions (see Section 25).

---

# 22. Success Metrics

For the prototype, success is defined by:

- All four agents complete independent analysis for a given candidate evaluation.
- Every major finding shown to the user contains at least one supporting evidence reference.
- At least one direct agent-to-agent response occurs during the debate stage for evaluations where a genuine conflict was detected.
- The system successfully identifies disagreements between agents when they exist.
- The final decision output exposes any unresolved concerns rather than omitting them.
- A user can successfully trace any given conclusion in the final report back to its source evidence.
- A complete candidate evaluation (upload through final report) can be completed within a reasonable, user-tolerable amount of time.

---

# 23. MVP Scope

**MVP / MUST HAVE**
- Document upload (resume, transcript; optional job description and interview transcript)
- Candidate Profile generation
- Evidence Ledger
- Four independent agents (Technical, HR/Culture, Hiring Manager, Skeptic), each an isolated, independent evaluation
- Real, targeted debate with direct agent-to-agent interaction and resolution status
- Final Deliberation stage producing a non-averaged recommendation
- Final Candidate Report with all required sections
- End-to-end evidence traceability from report statement to source quote

**NICE TO HAVE**
- Claim Confidence / Risk Map visualization
- Advanced/multi-round adaptive cross-examination
- Voice Hiring Room
- Exportable/shareable reports
- Advanced analytics across multiple candidates

---

# 24. Out of Scope

For the current prototype, the following are explicitly out of scope:

- Automated, binding hiring decisions — the system produces recommendations for human review, not final hiring actions.
- Integration with external ATS platforms or job boards.
- Multi-candidate comparison or ranking features.
- Long-term candidate data warehousing or analytics beyond a single evaluation session.
- Support for document types beyond resume, transcript, job description, and interview/assessment transcript.
- Real-time, unscripted live voice conversation between agents (the Voice Hiring Room is strictly a narration of the validated, pre-generated debate transcript).

---

# 25. Acceptance Criteria / Definition of Done

- [ ] A user can upload a resume and transcript and start an evaluation.
- [ ] A structured Candidate Profile is generated from the uploaded documents.
- [ ] Claims are extracted from the documents with linked evidence and source quotes.
- [ ] Four distinct agents (Technical, HR/Culture, Hiring Manager, Skeptic) exist and each produces a structured, independent evaluation.
- [ ] Each agent's independent evaluation runs as a separate, isolated call.
- [ ] No agent's independent evaluation shows access to another agent's conclusions before debate.
- [ ] Every major opinion shown to the user references specific evidence.
- [ ] The debate stage contains at least one direct, targeted agent-to-agent response (not a side-by-side restatement).
- [ ] At least one agent can fully or partially revise its position during debate.
- [ ] Every detected conflict is marked Resolved, Partially Resolved, or Unresolved.
- [ ] The final recommendation is generated through a distinct deliberation stage, not by averaging agent scores.
- [ ] The final report contains: recommendation, confidence, strengths, concerns, evidence, agent disagreements, unresolved issues, claims requiring verification, and interview questions.
- [ ] The Claim Confidence / Risk Map is available and reflects claim status accurately.
- [ ] Interview verification questions are generated and tied to specific unverified or disputed claims.
- [ ] The Voice Hiring Room, if implemented, only narrates the validated debate transcript and is always paired with a full text transcript.
- [ ] Accessibility basics (keyboard navigation, screen reader support, contrast, no color-only signaling) are implemented.
- [ ] API keys and provider credentials are never exposed to client-side code.
- [ ] Agent isolation is covered by automated tests demonstrating that no independent agent's input contains another agent's output.
