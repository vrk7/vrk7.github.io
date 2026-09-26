import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { CONTACT_LINKS, NAV_LINKS, PROFILE } from '../data/profile'
import { SOCIAL_ICONS } from './SocialIcons'

const SOLID_AFTER_PX = 80

export function IconLinks({ className }: { className: string }) {
  return (
    <nav className={className} aria-label="Contact links">
      {CONTACT_LINKS.map((l) => {
        const Icon = SOCIAL_ICONS[l.id]
        const isExternal = l.href.startsWith('http')
        return (
          <a
            key={l.id}
            className="icon-btn"
            href={l.href}
            aria-label={l.label}
            title={l.label}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Icon aria-hidden="true" />
          </a>
        )
      })}
    </nav>
  )
}

// Fixed top bar: monogram, section links, contact icons. Gains a glass backing once the page scrolls.
export default function Nav() {
  const { scrollY } = useScroll()
  const [isSolid, setIsSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setIsSolid(y > SOLID_AFTER_PX))

  return (
    <motion.header
      className={`nav${isSolid ? ' is-solid' : ''}`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="nav-brand" href="#top" aria-label={`${PROFILE.name}, back to top`}>
        <span className="nav-mark" aria-hidden="true">
          VR
        </span>
        <span className="nav-name">{PROFILE.name}</span>
      </a>
      <nav className="nav-links" aria-label="Sections">
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <IconLinks className="nav-icons" />
    </motion.header>
  )
}
