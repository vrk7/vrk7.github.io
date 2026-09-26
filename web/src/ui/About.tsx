import { lazy, Suspense, useEffect, useRef, useState, type Ref } from 'react'
import { animate, motion, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { VOICE_LOOP } from '../remotion/config'
import { PROFILE, STATS } from '../data/profile'

// Remotion ships in its own chunk; the frame keeps its size while it loads.
const VoicePlayer = lazy(() => import('./VoicePlayer'))

const EASE = [0.22, 1, 0.36, 1] as const
const STATEMENT = 'I build AI that listens, thinks and answers back in real time.'
const HIGHLIGHT = new Set(['listens,', 'real', 'time.'])

// One word of the statement: fades from dim to full as the heading scrolls through the viewport.
function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const opacity = useTransform(progress, [start, start + 1 / total], [0.16, 1])
  return (
    <motion.span className={HIGHLIGHT.has(word) ? 'word is-accent' : 'word'} style={{ opacity }}>
      {word}{' '}
    </motion.span>
  )
}

function Statement() {
  const ref = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.35'] })
  const words = STATEMENT.split(' ')
  return (
    <h2 className="about-statement" ref={ref} aria-label={STATEMENT}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Word key={i} word={w} index={i} total={words.length} progress={scrollYProgress} />
        ))}
      </span>
    </h2>
  )
}

function Stat({ value, prefix, suffix, label }: (typeof STATS)[number]) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const isYear = value > 1000
  const [shown, setShown] = useState(isYear ? value - 12 : 0)
  useEffect(() => {
    if (!isInView) return
    const controls = animate(isYear ? value - 12 : 0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, isYear, value])
  return (
    <div className="stat" ref={ref}>
      <div className="stat-value">
        {prefix}
        {shown}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

// Portrait revealed by a rising clip mask, with a slow counter-scroll on the image itself.
function Portrait() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  return (
    <motion.figure
      className="portrait"
      ref={ref}
      initial={{ clipPath: 'inset(100% 0% 0% 0% round 22px)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 22px)' }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 1.3, ease: EASE }}
    >
      <motion.picture style={{ y: imgY }}>
        <source srcSet={PROFILE.portrait.webp} type="image/webp" />
        <img
          src={PROFILE.portrait.jpg}
          width={PROFILE.portrait.width}
          height={PROFILE.portrait.height}
          alt={`Portrait of ${PROFILE.name}`}
          loading="lazy"
          decoding="async"
        />
      </motion.picture>
      <figcaption className="portrait-caption">
        <span>{PROFILE.name}</span>
        <span className="dim">{PROFILE.city}, DE</span>
      </figcaption>
    </motion.figure>
  )
}

// Frame + caption around the lazily loaded Remotion player.
function VoiceCard() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { margin: '0px 0px -10% 0px' })

  return (
    <motion.div
      className="voice-card"
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, delay: 0.35, ease: EASE }}
    >
      <div className="voice-frame" style={{ aspectRatio: `${VOICE_LOOP.width} / ${VOICE_LOOP.height}` }}>
        <Suspense fallback={null}>
          <VoicePlayer isInView={isInView} />
        </Suspense>
      </div>
      <p className="voice-card-caption">
        <span className="mono">Fig. 01</span> A caller interrupts; the agent yields mid-sentence.
      </p>
    </motion.div>
  )
}

export default function About({ innerRef }: { innerRef: Ref<HTMLElement> }) {
  return (
    <section className="about" id="about" ref={innerRef}>
      <div className="about-col">
        <p className="section-label">
          <span className="mono">(01)</span> About
        </p>
        <Statement />
        <div className="about-grid">
          <Portrait />
          <div className="about-text">
            <motion.p
              className="about-bio"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {PROFILE.bio}
            </motion.p>
            <div className="stats">
              {STATS.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </div>
          </div>
          <VoiceCard />
        </div>
      </div>
    </section>
  )
}
