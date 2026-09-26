// Works gallery data. Sections become the horizontally scrolling cards; clicking an
// item opens its detail, rendered from src/content/works/<slug>.md when one exists.
// Pure data: Works.tsx only renders it.
//
// Section fields:
//   id        unique key
//   no        '01'…
//   title     card title
//   tagline   one line under the title
//   items[]   flat list: { name, meta?, tags?, link?, slug? }
//   groups[]  grouped list (instead of items): { heading, items: string[] }
//   awards[]  optional chips
//   footer    optional small line at the bottom

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

export const WORKS: WorksLang = {
  title: 'Work',
  closeLabel: 'Back',
  openLabel: 'Explore',
  hint: 'Keep scrolling',
  awardsLabel: 'Awards',
  visitLabel: 'Open link',
  detailPlaceholder: 'Details coming soon.',
  phImageLabel: 'Image / Video',
  phButtonLabel: 'Link',
  countLabel: (n) => `${n} works`,
  sections: [
    {
      id: 'projects',
      no: '01',
      title: 'Selected Projects',
      tagline: 'Freelance · AI systems shipped end to end',
      items: [
        { name: 'Bilingual Voice Agent (Malayalam / English)', meta: 'Sub-400 ms barge-in', slug: 'bilingual-voice-agent' },
        { name: 'Legal Document Search Engine', meta: 'Full-stack RAG', slug: 'legal-document-search' },
        { name: 'Autonomous WhatsApp Sales Agent', meta: 'Next.js · Redis', slug: 'whatsapp-sales-agent' },
        { name: 'Procurement Intelligence Platform', meta: 'In progress', slug: 'procurement-intelligence' },
        { name: 'AI-Guided Supplier Registration', meta: 'Chrome extension', slug: 'supplier-registration' },
        { name: 'Computer Use Backend', meta: 'Agent BFF · SSE', slug: 'computer-use-backend' },
      ],
    },
    {
      id: 'research',
      no: '02',
      title: 'Research',
      tagline: 'Harvard Medical School · University of Surrey · Sony Europe',
      items: [
        { name: 'Surgical Segmentation & Tracking', meta: '92% IoU', slug: 'surgical-segmentation' },
        { name: 'Visual Question Localized-Answering', meta: 'Surgical AI', slug: 'vqla' },
        { name: 'Text-to-3D Animal Generation', meta: 'Gaussian Splatting', slug: 'text-to-3d-animals' },
        { name: 'Differentiable Wave-Optics Simulation', meta: 'PyTorch · GPU', slug: 'wave-optics' },
      ],
    },
    {
      id: 'stack',
      no: '03',
      title: 'Technical Skills',
      tagline: 'What I build with',
      groups: [
        { heading: 'Languages', items: ['TypeScript · JavaScript · Node.js · Python · Rust · SQL'] },
        { heading: 'AI & ML', items: ['PyTorch · Scikit-learn · Pandas · NumPy'] },
        { heading: 'AI Tooling & Agents', items: ['Claude Code · Cursor · Codex · LangGraph · Vercel AI SDK'] },
        { heading: 'Backend & APIs', items: ['FastAPI · RESTful APIs · WebSockets · SSE · SQLAlchemy'] },
        {
          heading: 'Databases & Vector Stores',
          items: ['PostgreSQL · MongoDB · Redis · ChromaDB · pgvector · Elasticsearch · Drizzle ORM'],
        },
        { heading: 'Frontend', items: ['React · Next.js · TailwindCSS · TanStack'] },
        { heading: 'Infrastructure', items: ['Docker · Kubernetes · GitHub Actions CI/CD · Vercel · AWS · Linux · Nginx'] },
      ],
    },
  ],
}

// Optional full-height cover per section (public/works/covers/<id>.jpg).
// A missing image falls back to the large-number gradient placeholder.
export const SECTION_COVERS: Record<string, string> = {}

// Number of works in a section (items or summed groups).
export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
