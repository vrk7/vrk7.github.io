import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { PROFILE } from '../data/profile'

const EASE = [0.22, 1, 0.36, 1] as const
const CLOCK_TICK_MS = 15_000

// Each letter rises out of a clipped line, staggered like a title card.
function SplitLine({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="split-line" aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          className="split-char"
          initial={{ y: '105%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 1.1, delay: delay + i * 0.035, ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

function useCityTime(timeZone: string) {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short' }).format(
      new Date(),
    )
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = setInterval(() => setTime(format()), CLOCK_TICK_MS)
    return () => clearInterval(id)
    // format only depends on timeZone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])
  return time
}

// Fixed bottom strip on the first screen; fades as soon as the page scrolls.
export function HeroStrip({ opacity }: { opacity: MotionValue<number> }) {
  const time = useCityTime(PROFILE.timeZone)
  return (
    <motion.div className="hero-strip" style={{ opacity }} aria-hidden="true">
      <span>
        {PROFILE.city}, DE <span className="dim">·</span> {time}
      </span>
      <span className="hero-scroll">
        <span className="hero-scroll-track">
          <span className="hero-scroll-dot" />
        </span>
        Scroll
      </span>
      <span className="hide-sm">Voice agents · LLM systems · RAG</span>
    </motion.div>
  )
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  // 0 while the hero fills the viewport, 1 once it has scrolled away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // The two name lines drift apart as the page leaves the hero.
  const firstX = useTransform(scrollYProgress, [0, 1], ['0vw', '-14vw'])
  const lastX = useTransform(scrollYProgress, [0, 1], ['0vw', '9vw'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const blur = useTransform(scrollYProgress, [0, 0.6], ['blur(0px)', 'blur(12px)'])
  const detailY = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <section className="hero" id="top" ref={ref}>
      <motion.div className="hero-inner" style={{ opacity, filter: blur }}>
        <h1 className="hero-name" aria-label={PROFILE.name}>
          <motion.span className="hero-name-row" style={{ x: firstX }}>
            <SplitLine text={PROFILE.firstName} delay={0.35} />
          </motion.span>
          <motion.span className="hero-name-row is-outline" style={{ x: lastX }}>
            <SplitLine text={PROFILE.lastName} delay={0.55} />
          </motion.span>
        </h1>

        <motion.div className="hero-detail" style={{ y: detailY }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
          >
            <p className="hero-lede">
              {PROFILE.role} building <em>realtime voice</em> and chat agents that listen, reason and talk back.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#work">
                See selected work <span aria-hidden="true">↓</span>
              </a>
              <a className="btn btn-ghost" href="#contact">
                Get in touch
              </a>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
