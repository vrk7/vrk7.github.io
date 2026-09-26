import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Player, type PlayerRef } from '@remotion/player'
import { VoiceLoop } from '../remotion/VoiceLoop'
import { VOICE_LOOP } from '../remotion/config'

const STILL_FRAME = 200 // frame shown when the viewer prefers reduced motion

// The Remotion composition, played live. Loaded lazily from About; pauses off screen and shows a
// still frame under reduced motion.
export default function VoicePlayer({ isInView }: { isInView: boolean }) {
  const playerRef = useRef<PlayerRef>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (prefersReducedMotion) {
      player.pause()
      player.seekTo(STILL_FRAME)
    } else if (isInView) {
      player.play()
    } else {
      player.pause()
    }
  }, [isInView, prefersReducedMotion])

  return (
    <Player
      ref={playerRef}
      component={VoiceLoop}
      durationInFrames={VOICE_LOOP.durationInFrames}
      fps={VOICE_LOOP.fps}
      compositionWidth={VOICE_LOOP.width}
      compositionHeight={VOICE_LOOP.height}
      loop
      controls={false}
      clickToPlay={false}
      acknowledgeRemotionLicense
      style={{ width: '100%', height: '100%' }}
    />
  )
}
