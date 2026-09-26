import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion'

// A looping Remotion composition played live by @remotion/player in the About section.
// Story (30 fps, 9 s): the caller speaks, the model thinks, the agent answers, the caller
// barges in and the agent yields. Every value derives from the frame, so the Player can
// seek, loop and pause it without drift.


const INK = '#f3efe7'
const MUTED = 'rgba(243, 239, 231, 0.5)'
const LINE = 'rgba(243, 239, 231, 0.12)'
const ACCENT = '#ff6b35'
const LIVE = '#7fe3ff'
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Archivo', system-ui, sans-serif"

type Speaker = 'user' | 'agent' | null

// Timeline in frames.
const T = {
  userStart: 8,
  userEnd: 84,
  thinkEnd: 112,
  agentEnd: 176, // the caller interrupts here
  bargeStart: 176,
  bargeEnd: 236,
  fadeOut: 250,
}
const BARGE_LATENCY_MS = 380

const USER_LINE = 'Can I move my delivery to tomorrow?'
const AGENT_LINE = 'Sure. Tomorrow between ten and twelve works, or would you'
const BARGE_LINE = 'Actually, evening please.'

const BAR_COUNT = 56
const BAR_STEP = 2 // frames per bar as the waveform scrolls left

function speakerAt(f: number): Speaker {
  if (f >= T.userStart && f < T.userEnd) return 'user'
  if (f >= T.thinkEnd && f < T.agentEnd) return 'agent'
  if (f >= T.bargeStart && f < T.bargeEnd) return 'user'
  return null
}

// Slice-based typewriter (never per-character opacity).
function typed(text: string, frame: number, start: number, charFrames: number): string {
  const n = Math.floor((frame - start) / charFrames)
  return text.slice(0, Math.max(0, Math.min(text.length, n)))
}

function Waveform({ frame }: { frame: number }) {
  const bars = []
  for (let k = 0; k < BAR_COUNT; k++) {
    const slot = Math.floor(frame / BAR_STEP) - (BAR_COUNT - 1 - k)
    const t = slot * BAR_STEP
    const who = speakerAt(t)
    const jitter = random(`bar-${slot}`)
    // Syllable envelope so speech looks like words, not static.
    const syllable = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.37))
    const amp = who ? 0.18 + 0.82 * jitter * syllable : 0.05 + 0.04 * jitter
    bars.push(
      <div
        key={k}
        style={{
          flex: 1,
          height: `${Math.round(amp * 100)}%`,
          borderRadius: 3,
          background: who === 'agent' ? ACCENT : who === 'user' ? INK : LINE,
          opacity: who ? 0.95 : 1,
        }}
      />,
    )
  }
  return <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 96 }}>{bars}</div>
}

function Stage({ label, active, frame, at }: { label: string; active: boolean; frame: number; at: number }) {
  const { fps } = useVideoConfig()
  const pop = spring({ frame: frame - at, fps, config: { damping: 20, stiffness: 200 } })
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : LINE}`,
        background: active ? 'rgba(255, 107, 53, 0.14)' : 'transparent',
        color: active ? INK : MUTED,
        fontFamily: MONO,
        fontSize: 15,
        letterSpacing: '0.06em',
        transform: `scale(${active ? 1 + 0.06 * (1 - pop) : 1})`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 7,
          background: active ? ACCENT : LINE,
        }}
      />
      {label}
    </div>
  )
}

function Caption({ who, text, cursor }: { who: 'YOU' | 'AGENT'; text: string; cursor: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', minHeight: 30 }}>
      <span
        style={{
          width: 62,
          flex: 'none',
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: '0.14em',
          color: who === 'AGENT' ? ACCENT : MUTED,
        }}
      >
        {who}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 21, lineHeight: 1.3, color: INK }}>
        {text}
        {cursor && <span style={{ color: ACCENT }}>▌</span>}
      </span>
    </div>
  )
}

export function VoiceLoop() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const fade = interpolate(frame, [0, 10, T.fadeOut, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const who = speakerAt(frame)
  const thinking = frame >= T.userEnd && frame < T.thinkEnd
  const blink = Math.floor(frame / 8) % 2 === 0

  const userText = typed(USER_LINE, frame, T.userStart, 2)
  const agentFull = typed(AGENT_LINE, frame, T.thinkEnd, 1.1)
  const agentText = frame >= T.bargeStart ? `${agentFull}…` : agentFull
  const bargeText = typed(BARGE_LINE, frame, T.bargeStart + 4, 2)

  // The latency badge springs in the moment the agent yields.
  const badge = spring({ frame: frame - T.bargeStart - 11, fps, config: { damping: 14, stiffness: 160 } })
  const seconds = (frame / fps).toFixed(2).padStart(5, '0')

  return (
    // A plain div rather than <AbsoluteFill>: it forwards `ref` React 19 style, which warns on React 18.
    // The background stays solid; only the content fades at the loop seam.
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(160deg, #17171a 0%, #0f0f11 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '26px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          opacity: fade,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: '0.12em',
            color: MUTED,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 9,
                background: LIVE,
                opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 9)),
                boxShadow: `0 0 12px ${LIVE}`,
              }}
            />
            <span style={{ color: INK }}>LIVE</span> · VOICE AGENT · ML / EN
          </span>
          <span>00:{seconds}</span>
        </div>

        <Waveform frame={frame} />

        {/* Pipeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stage
            label="ASR"
            active={who === 'user'}
            frame={frame}
            at={who === 'user' && frame >= T.bargeStart ? T.bargeStart : T.userStart}
          />
          <span style={{ color: MUTED, fontFamily: MONO }}>→</span>
          <Stage label={thinking && blink ? 'LLM ··' : 'LLM'} active={thinking} frame={frame} at={T.userEnd} />
          <span style={{ color: MUTED, fontFamily: MONO }}>→</span>
          <Stage label="TTS" active={who === 'agent'} frame={frame} at={T.thinkEnd} />
          <div
            style={{
              marginLeft: 'auto',
              fontFamily: MONO,
              fontSize: 14,
              letterSpacing: '0.06em',
              color: INK,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(127, 227, 255, 0.12)',
              border: `1px solid rgba(127, 227, 255, 0.4)`,
              opacity: badge,
              transform: `translateY(${(1 - badge) * 10}px)`,
            }}
          >
            barge-in · {BARGE_LATENCY_MS} ms
          </div>
        </div>

        {/* Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
          {frame < T.bargeStart ? (
            <>
              <Caption who="YOU" text={userText} cursor={who === 'user' && blink} />
              {frame >= T.thinkEnd && <Caption who="AGENT" text={agentText} cursor={who === 'agent' && blink} />}
            </>
          ) : (
            <>
              <Caption who="AGENT" text={agentText} cursor={false} />
              <Caption who="YOU" text={bargeText} cursor={who === 'user' && blink} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
