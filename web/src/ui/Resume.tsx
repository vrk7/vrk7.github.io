import { useRef, type Ref } from 'react'
import { motion, useScroll } from 'framer-motion'
import { FOCUS_POINTS } from '../data/focusPoints'

interface ResumeEntry {
  period: string
  place: string
  role?: string
  location?: string
  points?: string[]
}

// Timeline entries, newest first (source: resume.tex). Each entry is one camera stop, so the count must
// match FOCUS_POINTS in data/focusPoints.ts.
const RESUME: { title: string; entries: ResumeEntry[] } = {
  title: 'Where I have shipped',
  entries: [
    {
      period: 'May 2026 – Ongoing',
      place: 'Stealth · Native AI voice assistant for desktop',
      role: 'Engineering',
      location: 'Remote, Germany',
      points: [
        'Building the macOS app, a commercial realtime AI voice assistant, on a two-engineer founding team: a production LLM agent loop with schema-validated tool calling, runtime validation of model output, per-tool timeouts and cancellation, and human approval gates for irreversible actions.',
        'Realtime speech-to-speech pipeline over a full-duplex WebSocket session with streaming, barge-in, structured error recovery and prompt-injection defences, in a GDPR-compliant product.',
        'LLM evaluation harnesses with golden test sets from production failures, React + TypeScript product surfaces, and the signed .app/DMG release pipeline.',
      ],
    },
    {
      period: 'Nov 2025 – Ongoing',
      place: 'Freelance · Pre-seed / Seed Startups',
      role: 'Full-Stack AI Engineer',
      location: 'Stuttgart, Germany',
      points: [
        'Shipped a bilingual Malayalam/English customer-care voice agent with sub-400 ms barge-in, guardrails and escalation to humans.',
        'Built a full-stack RAG legal document search engine, an autonomous WhatsApp sales agent, a procurement intelligence platform, and more. See Works below.',
      ],
    },
    {
      period: 'Sep 2025 – Oct 2025',
      place: 'Kontext.security',
      role: 'Full-stack Engineer',
      location: 'Freelance, Germany (Remote)',
      points: [
        '50% latency reduction with a TypeScript semantic retrieval microservice over Turbopuffer, with vector indexing, query-time filtering and HashiCorp Vault-backed ingestion, shipped with Docker and GitHub Actions CI/CD.',
        'Real-time avatar streaming web app in Next.js, TypeScript and React with LiveKit WebRTC, server-side JWT generation and WebSocket media transport.',
      ],
    },
    {
      period: 'Jun 2025 – Nov 2025',
      place: 'Sony Europe Limited',
      role: 'AI Engineer Intern',
      location: 'Stuttgart, Germany',
      points: [
        'Differentiable wave-optics simulation framework in PyTorch, joining Fourier-domain propagation with neural reconstruction for end-to-end hardware-software co-optimization.',
        'Performance-optimized GPU pipelines (FFT convolution, complex tensors, AMP, tiled overlap-add) trained across SLURM GPU clusters.',
        'Agentic orchestration infrastructure with LangGraph, coordinating multi-step LLM reasoning, tool execution and streaming responses.',
      ],
    },
    {
      period: 'Dec 2023 – Aug 2024',
      place: 'CVSSP Lab, University of Surrey',
      role: '3D Graphics Engineer',
      location: 'Remote, United Kingdom',
      points: [
        'Text-controllable 3D animal generation with 3D Gaussian Splatting, producing fine geometry and lifelike textures from prompts via Score Distillation Sampling.',
        'Integrated and benchmarked Shap-E, Stable Diffusion and Zero123 in one pipeline, evaluating multi-view consistency across 330K-sample datasets.',
      ],
    },
    {
      period: 'Aug 2023 – Mar 2024',
      place: 'Massachusetts General Hospital, Harvard Medical School',
      role: 'AI Engineer (Regulated Clinical / Surgical AI)',
      location: 'Boston, Massachusetts, USA',
      points: [
        'Real-time class-agnostic segmentation and tracking for robotic-surgery video with a memory-based Transformer: 92% IoU on robotic-arm tracking, 81–89% IoU on multi-class anatomy.',
        'Visual Question Localized-Answering (VQLA) module in PyTorch for surgical scene understanding, delivered into a query-driven clinical interface.',
      ],
    },
    {
      period: 'Sep 2019 – May 2022',
      place: 'Capgemini Technology Services India Limited',
      role: 'Senior Software Engineer · Finance Domain',
      location: 'Bangalore, India',
      points: [
        'ERP integration features for high-volume, audit-sensitive finance workflows on SAP, with transaction validation and reconciliation.',
        'RESTful APIs and OData services bridging TypeScript/JavaScript UIs with SAP ERP modules (FI/CO, MM), plus SQL-based reporting and reconciliation logic.',
        'Extracted logic from legacy Java, C++ and ABAP codebases to connect finance modules to new API layers.',
      ],
    },
    {
      period: 'Education',
      place: 'École Polytechnique · Plaksha University',
      points: [
        'École Polytechnique, France (2024 – 2025): Master in Artificial Intelligence and Advanced Visual Computing, CGPA 3.79/4.00',
        'Plaksha University (2022 – 2023): Post Graduate Diploma in AI, CGPA 8.98/10.00',
      ],
    },
  ],
}

const EASE = [0.22, 1, 0.36, 1] as const
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}
const pad = (n: number) => String(n).padStart(2, '0')

function Entry({ entry, index, total }: { entry: ResumeEntry; index: number; total: number }) {
  return (
    <motion.article
      className="tl-entry"
      data-point={FOCUS_POINTS[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      <div className="tl-body">
        <motion.div className="tl-meta" variants={itemV}>
          <span className="tl-index">
            {pad(index + 1)}
            <span className="dim">/{pad(total)}</span>
          </span>
          <span className="tl-period">{entry.period}</span>
        </motion.div>
        <motion.h3 className="tl-place" variants={itemV}>
          {entry.place}
        </motion.h3>
        {(entry.role || entry.location) && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role && <span>{entry.role}</span>}
            {entry.location && <span className="tl-location">{entry.location}</span>}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.article>
  )
}

export default function Resume({ innerRef }: { innerRef: Ref<HTMLElement> }) {
  const timelineRef = useRef<HTMLDivElement>(null)
  // The rail fills as the reader moves down the timeline.
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 0.3', 'end 0.7'] })
  const total = RESUME.entries.length
  return (
    <section className="resume" id="experience" lang="en" ref={innerRef}>
      <div className="resume-head">
        <p className="section-label">
          <span className="mono">(02)</span> Experience
        </p>
        <motion.h2
          className="resume-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {RESUME.title}
        </motion.h2>
      </div>
      <div className="timeline" ref={timelineRef}>
        <span className="tl-rail" aria-hidden="true">
          <motion.span className="tl-rail-fill" style={{ scaleY: scrollYProgress }} />
        </span>
        {RESUME.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} total={total} />
        ))}
      </div>
    </section>
  )
}
