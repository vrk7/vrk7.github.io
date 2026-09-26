// Composition settings for VoiceLoop. Kept apart from the component so the page can size the
// placeholder without pulling Remotion into the main bundle.
export const VOICE_LOOP = {
  fps: 30,
  durationInFrames: 270,
  width: 640,
  height: 360,
} as const
