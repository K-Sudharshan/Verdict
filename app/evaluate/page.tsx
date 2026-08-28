'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Layers, 
  Play, 
  User, 
  BookOpen 
} from 'lucide-react';
import { PipelineStepper } from '@/components/layout/PipelineStepper';
import { DocumentIntakeZone, DocumentSlotState } from '@/components/intake/DocumentIntakeZone';
import { EvaluationStatus } from '@/lib/validation/schemas';
import { RawDocumentInput } from '@/lib/services/profile-service';

export default function EvaluatePage() {
  const router = useRouter();

  const [candidateName, setCandidateName] = useState('Sarah Jenkins');
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack Architect');

  const [slots, setSlots] = useState<Record<string, DocumentSlotState>>({
    resume: {
      type: 'RESUME',
      label: 'Resume / CV',
      subLabel: 'Drop candidate PDF resume or paste text (Mandatory)',
      icon: FileText,
      required: true,
      file: null,
      status: 'READY',
      extractedData: {
        id: 'doc_resume_default',
        documentType: 'RESUME',
        originalFilename: 'Sarah_Jenkins_Resume.pdf',
        fileSizeBytes: 148000,
        pageCount: 2,
        fullText: `SARAH JENKINS
Email: sarah.jenkins@example.com | GitHub: github.com/sjenkins-dev

SUMMARY:
Staff Full-Stack Architect with 8+ years building enterprise SaaS platforms using TypeScript, React, Node.js, and PostgreSQL.

EXPERIENCE:
Staff Full-Stack Engineer | HyperGrowth SaaS (2022 - Present)
- Architected multi-tenant collaborative dashboard using React, WebSocket, and PostgreSQL, serving 300k active enterprise users.
- Optimized frontend bundle size by 45% and reduced Initial Page Load time from 3.8s to 1.1s.
- Led engineering task force of 5 developers migrating monolithic microservices to containerized GraphQL endpoints.
- Spearheaded company-wide accessibility audit achieving WCAG 2.1 AA compliance across 40+ web views.

Senior Software Engineer | DataSync Solutions (2019 - 2022)
- Built high-throughput ETL data pipeline in TypeScript and Redis processing 20M rows daily.
- Mentored 3 junior software engineers and conducted 100+ technical interviews.

EDUCATION:
B.S. in Computer Science | University of Washington (2015 - 2019)
- GPA: 3.85 / 4.0
- Coursework: Web Architecture, Database Management, Algorithms, Distributed Computing.

SKILLS:
- Languages: TypeScript, JavaScript, SQL, Python, Go
- Frontend: React, Next.js, Tailwind CSS, Redux, WebSockets
- Backend: Node.js, Express, GraphQL, PostgreSQL, Redis, Docker, AWS`,
        pages: [
          {
            pageNumber: 1,
            text: `SARAH JENKINS\nStaff Full-Stack Architect\nExperience at HyperGrowth SaaS (2022 - Present):\n- Architected multi-tenant collaborative dashboard using React and PostgreSQL serving 300k active enterprise users.\n- Optimized frontend bundle size by 45% and reduced Initial Page Load time from 3.8s to 1.1s.`,
            characterCount: 350
          },
          {
            pageNumber: 2,
            text: `EDUCATION: B.S. in Computer Science, University of Washington (GPA 3.85)\nSKILLS: TypeScript, React, Node.js, GraphQL, PostgreSQL, Redis, Docker, AWS.`,
            characterCount: 210
          }
        ],
        extractedAt: new Date().toISOString(),
        status: 'READY'
      },
      manualText: '',
      useManualText: false
    },
    transcript: {
      type: 'TRANSCRIPT',
      label: 'Academic Transcript',
      subLabel: 'University degrees, GPA, and verified coursework (Optional)',
      icon: GraduationCap,
      required: false,
      file: null,
      status: 'READY',
      extractedData: {
        id: 'doc_transcript_default',
        documentType: 'TRANSCRIPT',
        originalFilename: 'UW_Transcript_Sarah_Jenkins.pdf',
        fileSizeBytes: 98000,
        pageCount: 1,
        fullText: `OFFICIAL ACADEMIC TRANSCRIPT - UNIVERSITY OF WASHINGTON
Candidate: Sarah Jenkins | Degree: B.S. in Computer Science
Conferral Date: June 2019 | Cumulative GPA: 3.85 / 4.00

Verified Coursework:
- CSE 332: Data Structures and Parallelism (Grade: 3.9)
- CSE 451: Operating Systems (Grade: 3.8)
- CSE 414: Database Systems (Grade: 4.0)
- CSE 484: Computer Security (Grade: 3.8)`,
        pages: [
          {
            pageNumber: 1,
            text: `OFFICIAL ACADEMIC TRANSCRIPT - UNIVERSITY OF WASHINGTON\nCandidate: Sarah Jenkins | Degree: B.S. in Computer Science (GPA: 3.85)`,
            characterCount: 150
          }
        ],
        extractedAt: new Date().toISOString(),
        status: 'READY'
      },
      manualText: '',
      useManualText: false
    },
    jobDescription: {
      type: 'JOB_DESCRIPTION',
      label: 'Job Description',
      subLabel: 'Target role requirements, competencies, and expectations (Optional)',
      icon: Briefcase,
      required: false,
      file: null,
      status: 'READY',
      extractedData: {
        id: 'doc_jd_default',
        documentType: 'JOB_DESCRIPTION',
        originalFilename: 'Senior_Full_Stack_Architect_JD.txt',
        fileSizeBytes: 2400,
        pageCount: 1,
        fullText: `ROLE: Senior Full-Stack Architect
RESPONSIBILITIES:
- Architect scalable multi-tenant frontend and backend infrastructure.
- Deliver performant, accessible web applications with sub-second page loads.
- Mentor junior engineers and collaborate across product and design teams.

REQUIREMENTS:
- 5+ years with React, TypeScript, and modern database architectures (PostgreSQL/Redis).
- Proven track record of performance optimization and team mentorship.`,
        pages: [
          {
            pageNumber: 1,
            text: `ROLE: Senior Full-Stack Architect\nREQUIREMENTS: 5+ years React, TypeScript, PostgreSQL.`,
            characterCount: 120
          }
        ],
        extractedAt: new Date().toISOString(),
        status: 'READY'
      },
      manualText: '',
      useManualText: false
    },
    additionalEvidence: {
      type: 'INTERVIEW_TRANSCRIPT',
      label: 'Additional Evidence',
      subLabel: 'GitHub portfolio summaries, certifications, or work samples (Optional)',
      icon: BookOpen,
      required: false,
      file: null,
      status: 'IDLE',
      extractedData: null,
      manualText: '',
      useManualText: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStage, setCurrentStage] = useState<EvaluationStatus>('DOCUMENTS_PENDING');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track progress-animation timeout IDs so they can be cleared on unmount
  const stageTimerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      stageTimerRefs.current.forEach(clearTimeout);
    };
  }, []);

  const handleSlotChange = (key: string, updated: DocumentSlotState) => {
    setSlots(prev => ({
      ...prev,
      [key]: updated
    }));
  };

  const handlePreloadTemplate = (type: 'backend' | 'ml' | 'fullstack') => {
    if (type === 'backend') {
      setCandidateName('Alex Rivera');
      setRoleTitle('Lead Distributed Systems Engineer');
      handleSlotChange('resume', {
        ...slots.resume,
        file: null,
        status: 'READY',
        useManualText: false,
        extractedData: {
          id: 'doc_alex_resume',
          documentType: 'RESUME',
          originalFilename: 'Alex_Rivera_Resume_2026.pdf',
          fileSizeBytes: 148200,
          pageCount: 2,
          fullText: `ALEX RIVERA
Senior Distributed Systems Architect with 7+ years building low-latency backends using Go, Kafka, PostgreSQL, and Raft consensus.
- Architected multi-region PostgreSQL synchronization engine with Raft consensus serving 500k MAU.
- Reduced API response time by 40% through Redis cluster caching.
- Led distributed trace ingestion pipeline processing 100,000 Kafka events/sec.`,
          pages: [
            { pageNumber: 1, text: 'ALEX RIVERA\nSenior Distributed Systems Architect with Go and Kafka.', characterCount: 180 },
            { pageNumber: 2, text: 'Reduced API response time by 40% through Redis cluster caching.', characterCount: 120 }
          ],
          extractedAt: new Date().toISOString(),
          status: 'READY'
        }
      });
    } else if (type === 'ml') {
      setCandidateName('Dr. Jordan Chen');
      setRoleTitle('Staff ML Platform Architect');
      handleSlotChange('resume', {
        ...slots.resume,
        file: null,
        status: 'READY',
        useManualText: false,
        extractedData: {
          id: 'doc_jordan_resume',
          documentType: 'RESUME',
          originalFilename: 'Dr_Jordan_Chen_Resume.pdf',
          fileSizeBytes: 198000,
          pageCount: 3,
          fullText: `DR. JORDAN CHEN
Ph.D. in Computer Science from UC Berkeley. 6 NeurIPS publications on LLM quantization. Custom CUDA kernels in C++.
- Designed distributed training platform for 70B parameter models.
- Authored 6 first-author NeurIPS/ICML research papers.`,
          pages: [
            { pageNumber: 1, text: 'DR. JORDAN CHEN\nPh.D. UC Berkeley. Distributed training platform.', characterCount: 160 }
          ],
          extractedAt: new Date().toISOString(),
          status: 'READY'
        }
      });
    } else {
      setCandidateName('Sarah Jenkins');
      setRoleTitle('Senior Full-Stack Architect');
    }
  };

  const handleStartEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName.trim()) {
      setErrorMsg('Candidate Name is required.');
      return;
    }

    const resumeSlot = slots.resume;
    const resumeContent = resumeSlot.useManualText
      ? resumeSlot.manualText.trim()
      : resumeSlot.extractedData?.fullText.trim();

    if (!resumeContent) {
      setErrorMsg('Please upload a Resume PDF or enter resume text before starting evaluation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setCurrentStage('PROCESSING');

    try {
      // Build normalized documents payload
      const documentsPayload: RawDocumentInput[] = [];

      Object.entries(slots).forEach(([key, slot]) => {
        const text = slot.useManualText
          ? slot.manualText.trim()
          : slot.extractedData?.fullText.trim();

        if (text) {
          documentsPayload.push({
            id: slot.extractedData?.id || `doc_${slot.type.toLowerCase()}_${Date.now()}`,
            document_type: slot.type,
            original_filename: slot.file?.name || slot.extractedData?.originalFilename || `${slot.label}.pdf`,
            text_content: text,
            pages: slot.extractedData?.pages || [{ pageNumber: 1, text }]
          });
        }
      });

      // Visual progress feedback (cosmetic — actual stages happen server-side)
      stageTimerRefs.current.forEach(clearTimeout);
      stageTimerRefs.current = [
        setTimeout(() => setCurrentStage('AGENTS_RUNNING'), 1000),
        setTimeout(() => setCurrentStage('DEBATE_IN_PROGRESS'), 2500),
        setTimeout(() => setCurrentStage('DELIBERATING'), 4200)
      ];

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          roleTitle,
          documents: documentsPayload
        })
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        router.push(`/session/${data.evaluation.id}`);
      } else {
        setErrorMsg(data.error || 'Failed to process evaluation.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      stageTimerRefs.current.forEach(clearTimeout);
      setErrorMsg(err.message || 'Network error occurred during evaluation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-0 py-8 animate-in fade-in duration-300">
      {/* ── HEADER ── */}
      <div className="pb-8 border-b border-zinc-900">
        <p className="case-label mb-2">intake &amp; docket filing</p>
        <h1 className="font-display text-white leading-none" style={{ fontFamily: 'Abril Fatface, serif', fontSize: 'clamp(2.4rem, 5vw, 3.5rem)' }}>
          New Case Evaluation
        </h1>
        <p className="text-xs text-zinc-400 font-sans mt-3 max-w-2xl leading-relaxed">
          Upload candidate PDF files or select a pre-loaded template. Four independent AI agents analyze verbatim evidence, cross-examine discrepancies, and synthesize a defensible verdict.
        </p>
      </div>

      {/* Progress Stepper */}
      {isSubmitting && (
        <div className="dossier-section">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-sans font-semibold text-white flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              Deliberation Pipeline in Progress...
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Stage: {currentStage}
            </span>
          </div>
          <PipelineStepper status={currentStage} />
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleStartEvaluation} className="space-y-0">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 border border-zinc-700 text-white text-xs font-sans mb-6">
            <div className="flex items-center gap-2">
              <span className="stamp font-bold">ERROR</span>
              <p className="font-semibold">Evaluation Submission Failed</p>
            </div>
            <p className="text-zinc-400 mt-1 pl-12">{errorMsg}</p>
          </div>
        )}

        {/* Candidate Meta Info */}
        <div className="dossier-section">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
            <div>
              <p className="case-label mb-1">identity &amp; role target</p>
              <h2 className="font-display text-lg text-white" style={{ fontFamily: 'Abril Fatface, serif' }}>
                Candidate Information
              </h2>
            </div>

            {/* Quick-fill template links */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="case-label">TEMPLATES:</span>
              <button
                type="button"
                onClick={() => handlePreloadTemplate('fullstack')}
                className="text-zinc-500 hover:text-white underline transition-colors"
              >
                Sarah (Full-Stack)
              </button>
              <button
                type="button"
                onClick={() => handlePreloadTemplate('backend')}
                className="text-zinc-500 hover:text-white underline transition-colors"
              >
                Alex (Distributed)
              </button>
              <button
                type="button"
                onClick={() => handlePreloadTemplate('ml')}
                className="text-zinc-500 hover:text-white underline transition-colors"
              >
                Jordan (Staff ML)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="case-label block mb-2">
                CANDIDATE FULL NAME *
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 font-sans"
                required
              />
            </div>

            <div>
              <label className="case-label block mb-2">
                TARGET ROLE TITLE *
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Lead Distributed Systems Engineer"
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 font-sans"
                required
              />
            </div>
          </div>
        </div>

        {/* First-Class PDF & Document Intake Zone */}
        <div className="dossier-section">
          <DocumentIntakeZone
            slots={slots}
            onSlotChange={handleSlotChange}
          />
        </div>

        {/* Submit Bar */}
        <div className="dossier-section flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-500 font-sans">
            Deterministic Guarantees: Stage 1 isolation · Real PDF extraction · Verbatim evidence ledger
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-sans font-semibold text-black bg-white hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                Launch Multi-Agent Deliberation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
