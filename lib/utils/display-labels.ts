import { Evidence, Claim, ConflictRecord, AgentType } from '../validation/schemas';

export interface EvidenceLabelOptions {
  short?: boolean;
  withDoc?: boolean;
  prefix?: string;
}

/**
 * Returns a rich, human-readable label for an Evidence record.
 * Replaces technical IDs like 'EV_001' with 'Resume · Page 2' or 'Candidate Evidence · Transcript'.
 */
export function getEvidenceDisplayLabel(
  evidence?: Evidence | null,
  options: EvidenceLabelOptions = {}
): string {
  if (!evidence) {
    return options.short ? 'Evidence Quote' : 'Candidate Evidence Citation';
  }

  const docName = evidence.location?.document_name;
  const page = evidence.location?.page;
  const section = evidence.location?.section;
  const docId = (evidence.document_id || '').toLowerCase();

  let sourceLabel = 'Resume';
  if (docName) {
    const lowerDoc = docName.toLowerCase();
    if (lowerDoc.includes('transcript')) sourceLabel = 'Transcript';
    else if (lowerDoc.includes('jd') || lowerDoc.includes('job')) sourceLabel = 'Job Description';
    else if (lowerDoc.includes('interview')) sourceLabel = 'Interview Notes';
    else sourceLabel = docName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  } else if (docId.includes('transcript')) {
    sourceLabel = 'Transcript';
  } else if (docId.includes('jd') || docId.includes('job')) {
    sourceLabel = 'Job Description';
  } else if (docId.includes('interview')) {
    sourceLabel = 'Interview Notes';
  }

  if (options.short) {
    if (page && page > 1) {
      return `${sourceLabel} · p.${page}`;
    }
    return `${sourceLabel} Evidence`;
  }

  const parts: string[] = [];
  if (options.prefix) {
    parts.push(options.prefix);
  } else {
    parts.push(sourceLabel);
  }

  if (section && section !== 'Experience' && section !== 'Main') {
    parts.push(section);
  }

  if (page && page > 0) {
    parts.push(`Page ${page}`);
  }

  return parts.join(' · ');
}

/**
 * Returns a human-readable label for a Candidate Claim.
 * Replaces 'CL_001' with 'Candidate Claim · Technical Experience' or category descriptions.
 */
export function getClaimDisplayLabel(
  claim?: Claim | null,
  index?: number
): string {
  if (!claim) {
    return typeof index === 'number' ? `Candidate Claim #${index + 1}` : 'Candidate Claim';
  }

  const categoryMap: Record<string, string> = {
    EXPERIENCE: 'Work Experience',
    ACHIEVEMENT: 'Performance Metric',
    LEADERSHIP: 'Mentorship & Leadership',
    SKILL: 'Technical Skill',
    PROJECT: 'Project Deliverable',
    OTHER: 'Candidate Claim'
  };

  const categoryName = claim.category ? (categoryMap[claim.category] || claim.category) : 'Candidate Claim';

  if (typeof index === 'number') {
    return `${categoryName} Claim #${index + 1}`;
  }

  return `Candidate Claim · ${categoryName}`;
}

/**
 * Returns a human-readable title for a Deliberation Conflict Topic.
 * Replaces 'CONF_001' with 'Topic 1: Cross-Examination Review'.
 */
export function getConflictDisplayLabel(
  conflict?: ConflictRecord | null,
  index?: number
): string {
  const prefix = typeof index === 'number' ? `Deliberation Topic #${index + 1}` : 'Deliberation Topic';
  if (!conflict || !conflict.description) return prefix;

  // Truncate long descriptions
  const cleanDesc = conflict.description.replace(/\(CONF_\w+\)/g, '').trim();
  if (cleanDesc.length <= 40) {
    return cleanDesc;
  }
  return `${cleanDesc.slice(0, 38)}...`;
}

/**
 * Returns human-readable label for an agent finding.
 * Replaces 'F_TECH_001' with 'Technical Analysis Finding'.
 */
export function getFindingDisplayLabel(
  agentType?: AgentType | string,
  index?: number
): string {
  const agentTitles: Record<string, string> = {
    TECHNICAL: 'Technical Analysis',
    HR_CULTURE: 'HR & Culture Observation',
    HIRING_MANAGER: 'Role Alignment Review',
    SKEPTIC: 'Risk Audit Finding'
  };

  const base = agentType ? (agentTitles[agentType] || 'Evaluation Finding') : 'Evaluation Finding';
  if (typeof index === 'number') {
    return `${base} #${index + 1}`;
  }
  return base;
}

/**
 * Cleans user-facing rationale and debate texts to replace raw internal IDs with smooth prose.
 */
export function sanitizeUserFacingText(text: string): string {
  if (!text) return '';

  return text
    // Replace evidence ID tuples like (EV_001, EV_002)
    .replace(/\(EV_\w+(?:,\s*EV_\w+)*\)/gi, '(verified from candidate evidence)')
    // Replace individual EV_XXX references
    .replace(/\bEV_\d+\b/gi, 'documentary evidence')
    // Replace CL_XXX references
    .replace(/\bCL_\d+\b/gi, 'candidate claim')
    // Replace CONF_XXX references
    .replace(/\bCONF_\d+\b/gi, 'cross-examination topic')
    // Replace F_AGENT_XXX references
    .replace(/\bF_[A-Z]+_\d+\b/gi, 'finding');
}
