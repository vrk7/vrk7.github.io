// Identity and contact data shared by the nav, hero, about and contact sections.

export const PROFILE = {
  name: 'Vysakh Ramakrishnan',
  firstName: 'Vysakh',
  lastName: 'Ramakrishnan',
  role: 'Full-Stack AI Engineer',
  city: 'Stuttgart',
  timeZone: 'Europe/Berlin',
  email: 'vysakhramkrishnan7@gmail.com',
  portrait: {
    webp: `${import.meta.env.BASE_URL}img/vysakh.webp`,
    jpg: `${import.meta.env.BASE_URL}img/vysakh.jpg`,
    width: 933,
    height: 1400,
  },
  bio: "I'm Vysakh, a full-stack AI engineer specialising in production voice and chat agents. I have shipped bilingual real-time voice agents end to end, with streaming ASR/TTS, sub-400 ms barge-in and graceful recovery, alongside LLM chat agents and RAG knowledge bases. Before that: surgical AI at Harvard Medical School and finance systems at Capgemini.",
} as const

export const CONTACT_LINKS = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/vrk7' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/vysakh-ramakrishnan' },
  { id: 'scholar', label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=thnJFoAAAAAJ&hl=en' },
  {
    id: 'cv',
    label: 'CV / Resume',
    href: 'https://drive.google.com/file/d/1-15o9IVGZ4qGZcPMEVwUSD8IiwR7WFSD/view?usp=sharing',
  },
  { id: 'mail', label: 'Email', href: `mailto:${PROFILE.email}` },
] as const

export const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
] as const

// Numbers shown in the About section. Every figure comes from resume.tex.
export const STATS = [
  { value: 400, prefix: '<', suffix: ' ms', label: 'Voice barge-in latency' },
  { value: 92, prefix: '', suffix: '%', label: 'IoU, surgical arm tracking' },
  { value: 50, prefix: '−', suffix: '%', label: 'Retrieval latency at Kontext' },
  { value: 2019, prefix: '', suffix: '', label: 'Shipping production code since' },
] as const
