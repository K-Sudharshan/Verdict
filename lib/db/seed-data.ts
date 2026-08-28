import { EvaluationFullAggregate } from '../validation/schemas';

export const SEED_EVALUATIONS: Record<string, EvaluationFullAggregate> = {
  'eval_alex_rivera': {
    id: 'eval_alex_rivera',
    candidate_id: 'cand_alex_01',
    candidate_name: 'Alex Rivera',
    role_title: 'Lead Distributed Systems Engineer',
    status: 'COMPLETE',
    evaluation_mode: 'DEMO',
    created_at: '2026-08-28T09:00:00Z',
    updated_at: '2026-08-28T09:05:30Z',
    documents: [
      {
        id: 'doc_alex_resume',
        document_type: 'RESUME',
        original_filename: 'Alex_Rivera_Resume_2026.pdf',
        status: 'PROCESSED',
        file_size_bytes: 148200,
        text_content: `ALEX RIVERA
Email: alex.rivera@example.com | Phone: (555) 382-9910 | GitHub: github.com/alexrivera-eng

SUMMARY
Senior Distributed Systems Architect with 7+ years of experience building resilient, low-latency microservices and event-driven backends using Go, Kafka, and PostgreSQL.

EXPERIENCE
Senior Backend Engineer | CloudScale Networks (2022 - Present)
- Architected multi-region PostgreSQL data synchronization engine with Raft consensus, serving 500k monthly active users with 99.99% uptime.
- Reduced API response time by 40% through Redis cluster caching and async event batching across 12 microservices.
- Led distributed trace ingestion pipeline processing 100,000 Kafka events per second with sub-50ms ingestion latency.
- Mentored 4 junior and mid-level engineers in distributed debugging, Go concurrency patterns, and test-driven architecture.

Software Engineer | Apex Streaming Inc. (2019 - 2022)
- Implemented real-time telemetry streaming service using Go, gRPC, and Redis Pub/Sub handling 15,000 requests/second.
- Migrated legacy monolithic services to containerized Docker workloads with automated CI/CD pipelines.
- Coordinated cross-team API contracts with frontend and product engineering teams.

EDUCATION
B.S. in Computer Science | Stanford University (2015 - 2019)
- GPA: 3.82 / 4.0
- Coursework: Distributed Systems, Operating Systems, Advanced Database Design, Computer Networks.

SKILLS
- Languages: Go, TypeScript, Python, SQL, C++
- Frameworks & Tools: gRPC, FastAPI, Docker, Kubernetes, Git, Prometheus, Grafana
- Databases & Storage: PostgreSQL, Redis, Apache Kafka, DynamoDB
- Core Competencies: Raft Consensus, Distributed Locks, High-Throughput Event Streaming, Fault-Tolerant System Design`
      },
      {
        id: 'doc_alex_transcript',
        document_type: 'TRANSCRIPT',
        original_filename: 'Stanford_Transcript_Alex_Rivera.pdf',
        status: 'PROCESSED',
        file_size_bytes: 89300,
        text_content: `OFFICIAL ACADEMIC TRANSCRIPT - STANFORD UNIVERSITY
Student: Alex Rivera | Degree: Bachelor of Science in Computer Science
Conferral Date: June 2019 | Cumulative GPA: 3.82

Relevant Coursework:
- CS 244B: Distributed Systems (Grade: A)
- CS 140: Operating Systems & Systems Programming (Grade: A)
- CS 145: Data Management and Database Systems (Grade: A-)
- CS 110: Principles of Computer Systems (Grade: A)`
      },
      {
        id: 'doc_alex_jd',
        document_type: 'JOB_DESCRIPTION',
        original_filename: 'Lead_Distributed_Systems_Engineer_JD.txt',
        status: 'PROCESSED',
        file_size_bytes: 3400,
        text_content: `ROLE: Lead Distributed Systems Engineer
RESPONSIBILITIES:
- Design, scale, and maintain high-throughput backend infrastructure processing millions of daily transactions.
- Implement distributed consensus and caching architectures for critical financial event pipelines.
- Mentor junior and intermediate backend engineers.

REQUIREMENTS:
- 5+ years building distributed backend services in Go, C++, or Rust.
- Deep expertise in Kafka, Redis, and transactional databases (PostgreSQL).
- Demonstrated experience in fault-tolerant architecture and team mentorship.`
      }
    ],
    profile: {
      id: 'prof_alex',
      evaluation_id: 'eval_alex_rivera',
      extraction_model: 'gemini-1.5-pro',
      generated_at: '2026-08-28T09:00:45Z',
      profile_data: {
        name: 'Alex Rivera',
        education: {
          degree: 'B.S. in Computer Science',
          institution: 'Stanford University',
          gpa: '3.82 / 4.0',
          coursework: [
            'CS 244B: Distributed Systems',
            'CS 140: Operating Systems',
            'CS 145: Database Systems',
            'CS 110: Principles of Computer Systems'
          ],
          certifications: ['AWS Certified Solutions Architect (Self-Reported)']
        },
        skills: {
          languages: ['Go', 'TypeScript', 'Python', 'SQL', 'C++'],
          frameworks: ['gRPC', 'FastAPI'],
          tools: ['Docker', 'Kubernetes', 'Git', 'Prometheus', 'Grafana'],
          cloud: ['AWS'],
          databases: ['PostgreSQL', 'Redis', 'Apache Kafka', 'DynamoDB'],
          other: ['Raft Consensus', 'Distributed Locks', 'High-Throughput Streaming', 'Fault Tolerance']
        },
        experience: [
          {
            title: 'Senior Backend Engineer',
            organization: 'CloudScale Networks',
            duration: '2022 - Present',
            description: 'Architected multi-region PostgreSQL synchronization with Raft; reduced API latency by 40%; managed 100k events/sec Kafka ingestion; mentored 4 engineers.',
            evidenceIds: ['EV_001', 'EV_002', 'EV_003', 'EV_005']
          },
          {
            title: 'Software Engineer',
            organization: 'Apex Streaming Inc.',
            duration: '2019 - 2022',
            description: 'Built real-time telemetry service in Go/gRPC/Redis handling 15k req/sec; migrated workloads to Docker containers.',
            evidenceIds: ['EV_004']
          }
        ],
        projects: [
          {
            name: 'Raft Distributed Key-Value Store',
            description: 'Open-source distributed state machine implementation in Go with leader election, log replication, and cluster membership reconfiguration.',
            technologies: ['Go', 'gRPC', 'Protobuf'],
            evidenceIds: ['EV_002']
          }
        ]
      }
    },
    claims: [
      {
        id: 'CL_001',
        evaluation_id: 'eval_alex_rivera',
        candidate_profile_id: 'prof_alex',
        claim_text: 'Reduced API response time by 40% through Redis cluster caching and async batching.',
        category: 'ACHIEVEMENT',
        status: 'PARTIALLY_SUPPORTED',
        status_updated_at: '2026-08-28T09:05:00Z',
        created_at: '2026-08-28T09:00:50Z'
      },
      {
        id: 'CL_002',
        evaluation_id: 'eval_alex_rivera',
        candidate_profile_id: 'prof_alex',
        claim_text: 'Architected multi-region PostgreSQL data synchronization engine with Raft consensus serving 500k MAU.',
        category: 'EXPERIENCE',
        status: 'WELL_SUPPORTED',
        status_updated_at: '2026-08-28T09:05:00Z',
        created_at: '2026-08-28T09:00:50Z'
      },
      {
        id: 'CL_003',
        evaluation_id: 'eval_alex_rivera',
        candidate_profile_id: 'prof_alex',
        claim_text: 'Managed Kafka ingestion pipeline processing 100,000 events/sec with sub-50ms latency.',
        category: 'ACHIEVEMENT',
        status: 'WELL_SUPPORTED',
        status_updated_at: '2026-08-28T09:05:00Z',
        created_at: '2026-08-28T09:00:50Z'
      },
      {
        id: 'CL_004',
        evaluation_id: 'eval_alex_rivera',
        candidate_profile_id: 'prof_alex',
        claim_text: 'Built gRPC telemetry service handling 15,000 req/sec at Apex Streaming.',
        category: 'EXPERIENCE',
        status: 'WELL_SUPPORTED',
        status_updated_at: '2026-08-28T09:05:00Z',
        created_at: '2026-08-28T09:00:50Z'
      },
      {
        id: 'CL_005',
        evaluation_id: 'eval_alex_rivera',
        candidate_profile_id: 'prof_alex',
        claim_text: 'Mentored 4 junior and mid-level engineers in Go concurrency and distributed debugging.',
        category: 'LEADERSHIP',
        status: 'WELL_SUPPORTED',
        status_updated_at: '2026-08-28T09:05:00Z',
        created_at: '2026-08-28T09:00:50Z'
      },
      {
        id: 'CL_006',
        evaluation_id: 'eval_alex_rivera',
        candidate_profile_id: 'prof_alex',
        claim_text: 'Production Kubernetes deployment and multi-cluster orchestration experience.',
        category: 'SKILL',
        status: 'UNVERIFIED',
        status_updated_at: '2026-08-28T09:05:00Z',
        created_at: '2026-08-28T09:00:50Z'
      }
    ],
    evidence: [
      {
        id: 'EV_001',
        evaluation_id: 'eval_alex_rivera',
        claim_id: 'CL_001',
        document_id: 'doc_alex_resume',
        quote_text: 'Reduced API response time by 40% through Redis cluster caching and async event batching across 12 microservices.',
        location: { section: 'Experience', page: 1 },
        created_at: '2026-08-28T09:00:55Z'
      },
      {
        id: 'EV_002',
        evaluation_id: 'eval_alex_rivera',
        claim_id: 'CL_002',
        document_id: 'doc_alex_resume',
        quote_text: 'Architected multi-region PostgreSQL data synchronization engine with Raft consensus, serving 500k monthly active users with 99.99% uptime.',
        location: { section: 'Experience', page: 1 },
        created_at: '2026-08-28T09:00:55Z'
      },
      {
        id: 'EV_003',
        evaluation_id: 'eval_alex_rivera',
        claim_id: 'CL_003',
        document_id: 'doc_alex_resume',
        quote_text: 'Led distributed trace ingestion pipeline processing 100,000 Kafka events per second with sub-50ms ingestion latency.',
        location: { section: 'Experience', page: 1 },
        created_at: '2026-08-28T09:00:55Z'
      },
      {
        id: 'EV_004',
        evaluation_id: 'eval_alex_rivera',
        claim_id: 'CL_004',
        document_id: 'doc_alex_resume',
        quote_text: 'Implemented real-time telemetry streaming service using Go, gRPC, and Redis Pub/Sub handling 15,000 requests/second.',
        location: { section: 'Experience', page: 1 },
        created_at: '2026-08-28T09:00:55Z'
      },
      {
        id: 'EV_005',
        evaluation_id: 'eval_alex_rivera',
        claim_id: 'CL_005',
        document_id: 'doc_alex_resume',
        quote_text: 'Mentored 4 junior and mid-level engineers in distributed debugging, Go concurrency patterns, and test-driven architecture.',
        location: { section: 'Experience', page: 1 },
        created_at: '2026-08-28T09:00:55Z'
      },
      {
        id: 'EV_006',
        evaluation_id: 'eval_alex_rivera',
        claim_id: null,
        document_id: 'doc_alex_transcript',
        quote_text: 'CS 244B: Distributed Systems (Grade: A); CS 140: Operating Systems & Systems Programming (Grade: A). Cumulative GPA: 3.82',
        location: { section: 'Academic Record', page: 1 },
        created_at: '2026-08-28T09:00:55Z'
      }
    ],
    agent_runs: [
      {
        id: 'run_tech_alex',
        evaluation_id: 'eval_alex_rivera',
        agent_type: 'TECHNICAL',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        prompt_version: 'v1.0',
        recommendation: 'STRONG_HIRE',
        confidence: 0.92,
        started_at: '2026-08-28T09:01:00Z',
        completed_at: '2026-08-28T09:01:30Z',
        created_at: '2026-08-28T09:01:00Z',
        output: {
          agent_type: 'TECHNICAL',
          recommendation: 'STRONG_HIRE',
          confidence: {
            level: 'HIGH',
            score: 0.92,
            reason: 'Exceptional hands-on distributed systems depth in Go, backed by rigorous Stanford CS coursework (CS244B Grade A) and concrete Raft consensus implementation.'
          },
          findings: [
            {
              finding_id: 'F_TECH_001',
              statement: 'Demonstrates deep mastery of distributed consensus and synchronization architectures in Go.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_002', 'EV_006'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            },
            {
              finding_id: 'F_TECH_002',
              statement: 'High-throughput event streaming capability confirmed by 100k events/sec Kafka pipeline and 15k req/sec gRPC telemetry.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_003', 'EV_004'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            },
            {
              finding_id: 'F_TECH_003',
              statement: 'Practical performance optimization demonstrated by 40% latency reduction across 12 microservices.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_001'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            }
          ],
          claims_to_investigate: [
            {
              claim_id: 'CL_006',
              reason: 'Kubernetes is listed in skills but lacks specific deployment manifests or cluster configuration evidence.'
            }
          ],
          questions_for_debate: [
            'How did the candidate guarantee consistency during network partitions in the multi-region Raft engine?'
          ]
        }
      },
      {
        id: 'run_hr_alex',
        evaluation_id: 'eval_alex_rivera',
        agent_type: 'HR_CULTURE',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        prompt_version: 'v1.0',
        recommendation: 'HIRE',
        confidence: 0.86,
        started_at: '2026-08-28T09:01:00Z',
        completed_at: '2026-08-28T09:01:28Z',
        created_at: '2026-08-28T09:01:00Z',
        output: {
          agent_type: 'HR_CULTURE',
          recommendation: 'HIRE',
          confidence: {
            level: 'HIGH',
            score: 0.86,
            reason: 'Strong evidence of sustained career growth, team mentorship, and clear technical communication.'
          },
          findings: [
            {
              finding_id: 'F_HR_001',
              statement: 'Documented investment in team growth via direct mentorship of 4 junior/mid-level engineers.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_005'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            },
            {
              finding_id: 'F_HR_002',
              statement: 'Solid tenure and steady progression from Software Engineer (3 yrs) to Senior Backend Engineer (4+ yrs).',
              stance: 'STRENGTH',
              evidence_ids: ['EV_002', 'EV_004'],
              support_level: 'SUPPORTED',
              severity: null
            }
          ],
          claims_to_investigate: [],
          questions_for_debate: [
            'What specific mentorship framework or onboarding documentation was created for junior team members?'
          ]
        }
      },
      {
        id: 'run_hm_alex',
        evaluation_id: 'eval_alex_rivera',
        agent_type: 'HIRING_MANAGER',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        prompt_version: 'v1.0',
        recommendation: 'HIRE',
        confidence: 0.88,
        started_at: '2026-08-28T09:01:00Z',
        completed_at: '2026-08-28T09:01:32Z',
        created_at: '2026-08-28T09:01:00Z',
        output: {
          agent_type: 'HIRING_MANAGER',
          recommendation: 'HIRE',
          confidence: {
            level: 'HIGH',
            score: 0.88,
            reason: 'Immediate capability match for core Lead Distributed Systems requirements. Time-to-productivity estimated at under 2 weeks.'
          },
          findings: [
            {
              finding_id: 'F_HM_001',
              statement: 'Direct match with core stack (Go, Kafka, PostgreSQL, Redis) reduces onboarding friction to near zero.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_002', 'EV_003'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            },
            {
              finding_id: 'F_HM_002',
              statement: 'Proven scale delivery at 500k MAU with 99.99% uptime guarantees business execution reliability.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_002'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            }
          ],
          claims_to_investigate: [
            {
              claim_id: 'CL_006',
              reason: 'Need to verify if candidate has hands-on cloud cost management or K8s multi-cluster experience.'
            }
          ],
          questions_for_debate: [
            'Can the candidate independently manage production on-call incidents without dedicated DevOps support?'
          ]
        }
      },
      {
        id: 'run_skeptic_alex',
        evaluation_id: 'eval_alex_rivera',
        agent_type: 'SKEPTIC',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        prompt_version: 'v1.0',
        recommendation: 'HOLD',
        confidence: 0.82,
        started_at: '2026-08-28T09:01:00Z',
        completed_at: '2026-08-28T09:01:35Z',
        created_at: '2026-08-28T09:01:00Z',
        output: {
          agent_type: 'SKEPTIC',
          recommendation: 'HOLD',
          confidence: {
            level: 'HIGH',
            score: 0.82,
            reason: 'High-impact performance metric (40% latency reduction) is unverified and lacks baseline benchmarking context; Kubernetes experience appears as an unevidenced buzzword.'
          },
          findings: [
            {
              finding_id: 'F_SKEP_001',
              statement: 'The claimed "40% latency reduction" (EV_001) lacks baseline measurements, traffic volume, or profiling methodology in available documents.',
              stance: 'CONCERN',
              evidence_ids: ['EV_001'],
              support_level: 'WEAKLY_SUPPORTED',
              severity: 'HIGH'
            },
            {
              finding_id: 'F_SKEP_002',
              statement: 'Kubernetes proficiency is listed in skills but has zero supporting project details or deployment history in any document.',
              stance: 'CONCERN',
              evidence_ids: [],
              support_level: 'INSUFFICIENT_EVIDENCE',
              severity: 'MEDIUM'
            }
          ],
          claims_to_investigate: [
            {
              claim_id: 'CL_001',
              reason: 'Unverified metric percentage without baseline or cluster concurrency specs.'
            },
            {
              claim_id: 'CL_006',
              reason: 'Skill name-dropping with no documentary evidence.'
            }
          ],
          questions_for_debate: [
            'On what documentary evidence does the Technical Agent assert that the 40% latency reduction represents high-scale distributed optimization rather than trivial Redis caching?'
          ]
        }
      }
    ],
    revisions: [
      {
        id: 'rev_tech_01',
        agent_run_id: 'run_tech_alex',
        debate_message_id: 'msg_003',
        revision_type: 'PARTIAL_REVISION',
        revised_recommendation: 'HIRE',
        revised_confidence: 0.82,
        reasoning: 'Conceded Skeptic critique that EV_001 lacks explicit baseline metrics and peak concurrency data. Revised finding F_TECH_003 from STRONGLY_SUPPORTED to SUPPORTED, and lowered recommendation from STRONG_HIRE to HIRE while maintaining confidence in general Go/Kafka architecture from EV_002 and EV_004.',
        output: null,
        created_at: '2026-08-28T09:03:15Z'
      }
    ],
    debate_session: {
      id: 'deb_alex_session',
      evaluation_id: 'eval_alex_rivera',
      status: 'COMPLETED',
      round_count: 2,
      max_rounds: 5,
      started_at: '2026-08-28T09:02:00Z',
      completed_at: '2026-08-28T09:04:10Z'
    },
    conflicts: [
      {
        id: 'CONF_001',
        debate_session_id: 'deb_alex_session',
        conflict_type: 'EVIDENCE_INTERPRETATION_CONFLICT',
        description: 'Backend Optimization & 40% Latency Reduction Claim Authenticity',
        agent_types: ['TECHNICAL', 'SKEPTIC'],
        related_claim_id: 'CL_001',
        status: 'RESOLVED',
        created_at: '2026-08-28T09:01:50Z',
        resolved_at: '2026-08-28T09:03:20Z'
      },
      {
        id: 'CONF_002',
        debate_session_id: 'deb_alex_session',
        conflict_type: 'HIGH_SEVERITY_CONCERN',
        description: 'Kubernetes Infrastructure Depth vs. Unverified Skill Buzzword',
        agent_types: ['HIRING_MANAGER', 'SKEPTIC'],
        related_claim_id: 'CL_006',
        status: 'PARTIALLY_RESOLVED',
        created_at: '2026-08-28T09:01:50Z',
        resolved_at: '2026-08-28T09:04:00Z'
      }
    ],
    debate_messages: [
      {
        id: 'msg_001',
        debate_session_id: 'deb_alex_session',
        conflict_id: 'CONF_001',
        sequence_number: 1,
        speaker_agent_type: 'SKEPTIC',
        target_agent_type: 'TECHNICAL',
        message_type: 'CHALLENGE',
        content: 'Technical Agent, you rated the candidate as STRONG_HIRE and cited EV_001 as proof of advanced performance engineering. However, EV_001 merely states a 40% latency reduction without any baseline numbers, RPS load, or profiling data. On what evidence do you infer high-concurrency mastery rather than standard Redis key-value caching?',
        structured_content: {
          targetFinding: 'F_TECH_003',
          challenge: 'Unsubstantiated performance metric percentage in EV_001',
          evidenceContext: ['EV_001']
        },
        created_at: '2026-08-28T09:02:15Z'
      },
      {
        id: 'msg_002',
        debate_session_id: 'deb_alex_session',
        conflict_id: 'CONF_001',
        sequence_number: 2,
        speaker_agent_type: 'TECHNICAL',
        target_agent_type: 'SKEPTIC',
        message_type: 'RESPONSE',
        content: 'I acknowledge the Skeptic\'s point that EV_001 alone lacks baseline telemetry details. However, EV_002 and EV_003 establish that the candidate architected a multi-region Raft consensus engine for 500k MAU and a 100k events/sec Kafka ingestion service. That said, I concede that the specific 40% metric under peak concurrency is only WEAKLY_SUPPORTED by the text.',
        structured_content: {
          targetFinding: 'F_TECH_003',
          evidenceContext: ['EV_001', 'EV_002', 'EV_003']
        },
        created_at: '2026-08-28T09:02:45Z'
      },
      {
        id: 'msg_003',
        debate_session_id: 'deb_alex_session',
        conflict_id: 'CONF_001',
        sequence_number: 3,
        speaker_agent_type: 'TECHNICAL',
        target_agent_type: 'SKEPTIC',
        message_type: 'REVISION',
        content: 'I am formally revising my recommendation from STRONG_HIRE to HIRE, and adjusting confidence from 0.92 to 0.82. The core Go/Kafka architecture competence remains well supported, but the metric claim must be verified during technical interviews.',
        structured_content: {
          revisionId: 'rev_tech_01',
          changeType: 'PARTIAL_REVISION'
        },
        created_at: '2026-08-28T09:03:15Z'
      },
      {
        id: 'msg_004',
        debate_session_id: 'deb_alex_session',
        conflict_id: 'CONF_002',
        sequence_number: 4,
        speaker_agent_type: 'SKEPTIC',
        target_agent_type: 'HIRING_MANAGER',
        message_type: 'CHALLENGE',
        content: 'Hiring Manager, you estimated onboarding at under 2 weeks assuming full stack mastery, yet Kubernetes is listed without a single deployment story (CL_006). If our team relies on container orchestration, how does this unverified skill impact ramp-up risk?',
        structured_content: {
          targetFinding: 'F_HM_001',
          challenge: 'Unverified Kubernetes operational skill',
          evidenceContext: []
        },
        created_at: '2026-08-28T09:03:40Z'
      },
      {
        id: 'msg_005',
        debate_session_id: 'deb_alex_session',
        conflict_id: 'CONF_002',
        sequence_number: 5,
        speaker_agent_type: 'HIRING_MANAGER',
        target_agent_type: 'SKEPTIC',
        message_type: 'DEFENSE',
        content: 'From a business standpoint, candidate has verified Docker migration experience (EV_004) and deep systems fundamentals (EV_006). In a senior engineering hire with strong Linux OS background, K8s manifest fluency is a low-risk 1-week ramp-up rather than a disqualifying gap. I maintain HIRE recommendation.',
        structured_content: {
          targetFinding: 'F_HM_001',
          evidenceContext: ['EV_004', 'EV_006']
        },
        created_at: '2026-08-28T09:04:05Z'
      }
    ],
    final_decision: {
      id: 'dec_alex_rivera',
      evaluation_id: 'eval_alex_rivera',
      recommendation: 'HIRE',
      confidence_level: 'HIGH',
      confidence_score: 0.86,
      reasoning: `Alex Rivera is strongly recommended for HIRE for the Lead Distributed Systems Engineer role. 

The evaluation is anchored on high-quality documentary evidence confirming practical distributed systems mastery: Alex designed a multi-region PostgreSQL synchronization system with Raft consensus serving 500k MAU (EV_002) and an event ingestion pipeline processing 100,000 Kafka events/sec with sub-50ms latency (EV_003). Academic foundations are stellar (Stanford B.S. CS, CS244B Grade A, EV_006).

Critically, the multi-agent debate functioned exactly as intended: the Skeptic Agent challenged the unverified "40% latency reduction" metric (EV_001), prompting the Technical Agent to concede the lack of baseline telemetry and responsibly revise its stance from STRONG_HIRE to HIRE. The Hiring Manager successfully contextualized the unverified Kubernetes skill as a minor ramp-up item easily mitigated during technical screening.

Rather than averaging numerical scores, the deliberation synthesized these perspectives into a decisive recommendation supported by targeted interview verification probes.`,
      strengths: [
        {
          statement: 'Proven large-scale Go & Kafka distributed architecture (100k events/sec with sub-50ms latency).',
          evidenceIds: ['EV_003', 'EV_004'],
          supportingAgents: ['TECHNICAL', 'HIRING_MANAGER']
        },
        {
          statement: 'Verified distributed consensus implementation (Raft engine serving 500k MAU with 99.99% uptime).',
          evidenceIds: ['EV_002', 'EV_006'],
          supportingAgents: ['TECHNICAL', 'HIRING_MANAGER']
        },
        {
          statement: 'Documented engineering leadership and mentorship of 4 engineers.',
          evidenceIds: ['EV_005'],
          supportingAgents: ['HR_CULTURE']
        }
      ],
      concerns: [
        {
          statement: 'Reported 40% API latency reduction lacks baseline measurement and cluster load telemetry in documentation.',
          evidenceIds: ['EV_001'],
          raisingAgent: 'SKEPTIC',
          severity: 'MEDIUM'
        },
        {
          statement: 'Kubernetes is claimed in skills list but lacks concrete deployment artifacts or manifest evidence.',
          evidenceIds: [],
          raisingAgent: 'SKEPTIC',
          severity: 'LOW'
        }
      ],
      verification_questions: [
        {
          question: 'Walk us through how you benchmarked and measured the reported 40% latency reduction across the 12 microservices. What was the baseline p99 latency?',
          claimId: 'CL_001',
          relatedConflictId: 'CONF_001',
          intent: 'Verify empirical performance engineering methodology and metric accuracy.'
        },
        {
          question: 'Describe your hands-on experience deploying and troubleshooting Kubernetes clusters in production. How do you handle pod disruption budgets and stateful failovers?',
          claimId: 'CL_006',
          relatedConflictId: 'CONF_002',
          intent: 'Verify container orchestration depth beyond tool familiarity.'
        }
      ],
      model_name: 'gemini-1.5-pro',
      created_at: '2026-08-28T09:05:30Z'
    }
  },

  'eval_jordan_chen': {
    id: 'eval_jordan_chen',
    candidate_id: 'cand_jordan_02',
    candidate_name: 'Dr. Jordan Chen',
    role_title: 'Staff ML Platform Architect',
    status: 'COMPLETE',
    evaluation_mode: 'DEMO',
    created_at: '2026-08-28T09:10:00Z',
    updated_at: '2026-08-28T09:14:30Z',
    documents: [
      {
        id: 'doc_jordan_resume',
        document_type: 'RESUME',
        original_filename: 'Dr_Jordan_Chen_Resume.pdf',
        status: 'PROCESSED',
        file_size_bytes: 162000,
        text_content: `DR. JORDAN CHEN
Ph.D. in Computer Science (Distributed Machine Learning) - UC Berkeley
Published 6 NeurIPS/ICML papers on LLM quantization and pipeline parallelism.
Built custom CUDA kernel optimization library for multi-GPU training clusters.
Led research engineering group of 6 researchers at AI Labs Inc.`
      },
      {
        id: 'doc_jordan_transcript',
        document_type: 'TRANSCRIPT',
        original_filename: 'UC_Berkeley_PhD_Transcript.pdf',
        status: 'PROCESSED',
        file_size_bytes: 94000,
        text_content: `UC BERKELEY GRADUATE DIVISION
Doctor of Philosophy in Computer Science - GPA: 3.96
Dissertation: Optimizing Large Model Inference Across Heterogeneous GPU Clusters`
      },
      {
        id: 'doc_jordan_jd',
        document_type: 'JOB_DESCRIPTION',
        original_filename: 'Staff_ML_Platform_Architect_JD.txt',
        status: 'PROCESSED',
        file_size_bytes: 3100,
        text_content: `ROLE: Staff ML Platform Architect
Focus: Fast-paced production inference serving with sub-10ms strict SLA and automated on-call operations.`
      }
    ],
    profile: {
      id: 'prof_jordan',
      evaluation_id: 'eval_jordan_chen',
      extraction_model: 'gemini-1.5-pro',
      generated_at: '2026-08-28T09:10:45Z',
      profile_data: {
        name: 'Dr. Jordan Chen',
        education: {
          degree: 'Ph.D. in Computer Science',
          institution: 'UC Berkeley',
          gpa: '3.96',
          coursework: ['Distributed Machine Learning', 'Advanced Computer Architecture', 'GPU Systems'],
          certifications: []
        },
        skills: {
          languages: ['Python', 'C++', 'CUDA', 'Rust'],
          frameworks: ['PyTorch', 'TensorRT', 'vLLM', 'Triton'],
          tools: ['Docker', 'NVIDIA Nsight', 'Git'],
          cloud: ['GCP', 'AWS'],
          databases: ['Redis', 'Milvus'],
          other: ['GPU Kernel Optimization', 'Pipeline Parallelism', 'FP8 Quantization']
        },
        experience: [
          {
            title: 'Staff Research Engineer',
            organization: 'AI Labs Inc.',
            duration: '2021 - Present',
            description: 'Led research engineering group of 6; authored 6 top-tier papers; built custom CUDA kernels for FP8 LLM serving.',
            evidenceIds: ['EV_J01', 'EV_J02']
          }
        ],
        projects: [
          {
            name: 'FlashInfer-Kernel',
            description: 'Custom CUDA kernels optimizing attention mechanisms for heterogeneous clusters.',
            technologies: ['C++', 'CUDA', 'PyTorch'],
            evidenceIds: ['EV_J02']
          }
        ]
      }
    },
    claims: [
      {
        id: 'CL_J01',
        evaluation_id: 'eval_jordan_chen',
        candidate_profile_id: 'prof_jordan',
        claim_text: 'Published 6 NeurIPS/ICML papers on LLM quantization and distributed inference.',
        category: 'ACHIEVEMENT',
        status: 'VERIFIED',
        status_updated_at: '2026-08-28T09:14:00Z',
        created_at: '2026-08-28T09:11:00Z'
      },
      {
        id: 'CL_J02',
        evaluation_id: 'eval_jordan_chen',
        candidate_profile_id: 'prof_jordan',
        claim_text: 'Built high-throughput CUDA kernel library for multi-GPU training and inference.',
        category: 'PROJECT',
        status: 'WELL_SUPPORTED',
        status_updated_at: '2026-08-28T09:14:00Z',
        created_at: '2026-08-28T09:11:00Z'
      },
      {
        id: 'CL_J03',
        evaluation_id: 'eval_jordan_chen',
        candidate_profile_id: 'prof_jordan',
        claim_text: '24/7 on-call production SLA management experience in cloud environments.',
        category: 'EXPERIENCE',
        status: 'UNVERIFIED',
        status_updated_at: '2026-08-28T09:14:00Z',
        created_at: '2026-08-28T09:11:00Z'
      }
    ],
    evidence: [
      {
        id: 'EV_J01',
        evaluation_id: 'eval_jordan_chen',
        claim_id: 'CL_J01',
        document_id: 'doc_jordan_resume',
        quote_text: 'Published 6 NeurIPS/ICML papers on LLM quantization and pipeline parallelism.',
        location: { section: 'Publications', page: 1 },
        created_at: '2026-08-28T09:11:10Z'
      },
      {
        id: 'EV_J02',
        evaluation_id: 'eval_jordan_chen',
        claim_id: 'CL_J02',
        document_id: 'doc_jordan_resume',
        quote_text: 'Built custom CUDA kernel optimization library for multi-GPU training clusters.',
        location: { section: 'Experience', page: 1 },
        created_at: '2026-08-28T09:11:10Z'
      },
      {
        id: 'EV_J03',
        evaluation_id: 'eval_jordan_chen',
        claim_id: null,
        document_id: 'doc_jordan_transcript',
        quote_text: 'Dissertation: Optimizing Large Model Inference Across Heterogeneous GPU Clusters. GPA: 3.96.',
        location: { section: 'Degree Summary', page: 1 },
        created_at: '2026-08-28T09:11:10Z'
      }
    ],
    agent_runs: [
      {
        id: 'run_tech_jordan',
        evaluation_id: 'eval_jordan_chen',
        agent_type: 'TECHNICAL',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        recommendation: 'STRONG_HIRE',
        confidence: 0.95,
        created_at: '2026-08-28T09:11:30Z',
        output: {
          agent_type: 'TECHNICAL',
          recommendation: 'STRONG_HIRE',
          confidence: {
            level: 'HIGH',
            score: 0.95,
            reason: 'World-class deep learning systems expertise with proven CUDA kernel implementation and Berkeley Ph.D. foundation.'
          },
          findings: [
            {
              finding_id: 'F_TJ_01',
              statement: 'Extraordinary low-level GPU programming depth (CUDA, C++, TensorRT).',
              stance: 'STRENGTH',
              evidence_ids: ['EV_J02', 'EV_J03'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            }
          ],
          claims_to_investigate: [],
          questions_for_debate: ['How does Jordan handle production microservice reliability outside research environments?']
        }
      },
      {
        id: 'run_hr_jordan',
        evaluation_id: 'eval_jordan_chen',
        agent_type: 'HR_CULTURE',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        recommendation: 'HIRE',
        confidence: 0.88,
        created_at: '2026-08-28T09:11:30Z',
        output: {
          agent_type: 'HR_CULTURE',
          recommendation: 'HIRE',
          confidence: { level: 'HIGH', score: 0.88, reason: 'Demonstrated research team leadership (led 6 researchers) and strong academic communication.' },
          findings: [
            {
              finding_id: 'F_HJ_01',
              statement: 'Led a team of 6 researchers and published across peer-reviewed conferences.',
              stance: 'STRENGTH',
              evidence_ids: ['EV_J01'],
              support_level: 'STRONGLY_SUPPORTED',
              severity: null
            }
          ],
          claims_to_investigate: [],
          questions_for_debate: []
        }
      },
      {
        id: 'run_hm_jordan',
        evaluation_id: 'eval_jordan_chen',
        agent_type: 'HIRING_MANAGER',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        recommendation: 'INTERVIEW_RECOMMENDED',
        confidence: 0.76,
        created_at: '2026-08-28T09:11:30Z',
        output: {
          agent_type: 'HIRING_MANAGER',
          recommendation: 'INTERVIEW_RECOMMENDED',
          confidence: {
            level: 'MEDIUM',
            score: 0.76,
            reason: 'Brilliant researcher, but role requires 24/7 on-call production SLA delivery. Need to verify transition from research prototypes to live customer serving.'
          },
          findings: [
            {
              finding_id: 'F_HMJ_01',
              statement: 'High academic research pedigree may not translate directly to fast startup on-call operations without production verification.',
              stance: 'CONCERN',
              evidence_ids: ['EV_J01'],
              support_level: 'SUPPORTED',
              severity: 'MEDIUM'
            }
          ],
          claims_to_investigate: [{ claim_id: 'CL_J03', reason: 'No on-call production SLA evidence in research background.' }],
          questions_for_debate: ['Is the candidate willing to handle operational infrastructure maintenance versus pure algorithmic innovation?']
        }
      },
      {
        id: 'run_skeptic_jordan',
        evaluation_id: 'eval_jordan_chen',
        agent_type: 'SKEPTIC',
        status: 'COMPLETED',
        retry_count: 0,
        model_name: 'gemini-1.5-pro',
        recommendation: 'INTERVIEW_RECOMMENDED',
        confidence: 0.81,
        created_at: '2026-08-28T09:11:30Z',
        output: {
          agent_type: 'SKEPTIC',
          recommendation: 'INTERVIEW_RECOMMENDED',
          confidence: { level: 'HIGH', score: 0.81, reason: 'CUDA and research achievements are verified, but production operational reliability is completely absent.' },
          findings: [
            {
              finding_id: 'F_SKJ_01',
              statement: 'Zero documentation of production incident management, latency SLA guarantees, or live customer-facing deployments.',
              stance: 'CONCERN',
              evidence_ids: [],
              support_level: 'INSUFFICIENT_EVIDENCE',
              severity: 'HIGH'
            }
          ],
          claims_to_investigate: [{ claim_id: 'CL_J03', reason: 'Missing production operational evidence.' }],
          questions_for_debate: ['Has the candidate ever managed high-availability production deployments under strict client SLAs?']
        }
      }
    ],
    revisions: [],
    debate_session: {
      id: 'deb_jordan_session',
      evaluation_id: 'eval_jordan_chen',
      status: 'COMPLETED',
      round_count: 1,
      max_rounds: 5,
      started_at: '2026-08-28T09:12:00Z',
      completed_at: '2026-08-28T09:13:30Z'
    },
    conflicts: [
      {
        id: 'CONF_J01',
        debate_session_id: 'deb_jordan_session',
        conflict_type: 'RECOMMENDATION_CONTRADICTION',
        description: 'Research Innovation Pedigree vs. Production On-Call Operations Fit',
        agent_types: ['TECHNICAL', 'HIRING_MANAGER'],
        related_claim_id: 'CL_J03',
        status: 'RESOLVED',
        created_at: '2026-08-28T09:12:10Z',
        resolved_at: '2026-08-28T09:13:20Z'
      }
    ],
    debate_messages: [
      {
        id: 'msg_j01',
        debate_session_id: 'deb_jordan_session',
        conflict_id: 'CONF_J01',
        sequence_number: 1,
        speaker_agent_type: 'HIRING_MANAGER',
        target_agent_type: 'TECHNICAL',
        message_type: 'CHALLENGE',
        content: 'Technical Agent, Jordan\'s CUDA publications (EV_J01) are brilliant, but this role requires maintaining a live serving tier with 99.9% uptime. How do we ensure they thrive in operational production firefighting rather than academic paper writing?',
        structured_content: { targetFinding: 'F_TJ_01', evidenceContext: ['EV_J01'] },
        created_at: '2026-08-28T09:12:20Z'
      },
      {
        id: 'msg_j02',
        debate_session_id: 'deb_jordan_session',
        conflict_id: 'CONF_J01',
        sequence_number: 2,
        speaker_agent_type: 'TECHNICAL',
        target_agent_type: 'HIRING_MANAGER',
        message_type: 'RESPONSE',
        content: 'Jordan\'s custom CUDA kernels (EV_J02) demonstrate deep hardware-level execution discipline that easily adapts to production inference engines (vLLM/Triton). However, I agree that live on-call willingness should be tested explicitly in the interview.',
        structured_content: { targetFinding: 'F_TJ_01', evidenceContext: ['EV_J02'] },
        created_at: '2026-08-28T09:13:00Z'
      }
    ],
    final_decision: {
      id: 'dec_jordan_chen',
      evaluation_id: 'eval_jordan_chen',
      recommendation: 'INTERVIEW_RECOMMENDED',
      confidence_level: 'HIGH',
      confidence_score: 0.89,
      reasoning: `Dr. Jordan Chen is strongly recommended for INTERVIEW for the Staff ML Platform Architect position.

The candidate brings rare, world-class GPU systems capability (UC Berkeley Ph.D., 6 NeurIPS/ICML publications, custom CUDA kernels EV_J01, EV_J02). However, because the target role demands live on-call SLA operations, the Hiring Manager and Skeptic agents rightfully flagged the absence of commercial production deployment history (CL_J03). 

Rather than diluting the score or rejecting the candidate, the deliberation team determined that Jordan's technical ceiling is exceptionally high, and the remaining risk should be resolved via focused operational interview questions.`,
      strengths: [
        { statement: 'World-class CUDA & GPU systems programming depth.', evidenceIds: ['EV_J02', 'EV_J03'], supportingAgents: ['TECHNICAL'] },
        { statement: 'Top-tier research leadership (6 publications at NeurIPS/ICML, led 6 researchers).', evidenceIds: ['EV_J01'], supportingAgents: ['TECHNICAL', 'HR_CULTURE'] }
      ],
      concerns: [
        { statement: 'Absence of commercial 24/7 on-call production SLA history in available documentation.', evidenceIds: [], raisingAgent: 'SKEPTIC', severity: 'MEDIUM' }
      ],
      verification_questions: [
        {
          question: 'Walk us through how you would architect automatic failover and degradation for a 100-GPU cluster when an NVIDIA driver crash occurs during live inference.',
          claimId: 'CL_J03',
          relatedConflictId: 'CONF_J01',
          intent: 'Assess operational troubleshooting vs research prototyping.'
        }
      ],
      model_name: 'gemini-1.5-pro',
      created_at: '2026-08-28T09:14:30Z'
    }
  }
};
