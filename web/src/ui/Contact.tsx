import { motion } from 'framer-motion'
import { PROFILE } from '../data/profile'
import { IconLinks } from './Nav'

const EASE = [0.22, 1, 0.36, 1] as const

export default function Contact() {
  const year = new Date().getFullYear()
  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <p className="section-label">
          <span className="mono">(04)</span> Contact
        </p>
        <motion.h2
          className="contact-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1, ease: EASE }}
        >
          Let's build something
          <br />
          that <span className="is-accent">talks back.</span>
        </motion.h2>
        <motion.a
          className="contact-mail"
          href={`mailto:${PROFILE.email}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        >
          {PROFILE.email}
          <span aria-hidden="true" className="contact-arrow">
            ↗
          </span>
        </motion.a>
        <IconLinks className="contact-icons" />
      </div>
      <footer className="footer">
        <span>
          © {year} {PROFILE.name}
        </span>
        <span className="hide-sm">Built with React Three Fiber and Remotion</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </section>
  )
}
