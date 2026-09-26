import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { MotionConfig, motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Nav from './ui/Nav'
import Hero, { HeroStrip } from './ui/Hero'
import About from './ui/About'
import Resume from './ui/Resume'
import Works from './ui/Works'
import Contact from './ui/Contact'
import LoadingScreen from './ui/LoadingScreen'
import { useStore } from './store'

function Backdrop() {
  // 点击空白处收起详情
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default function App() {
  const { scrollY } = useScroll()

  // About sits on the left while the robot is framed on the right: shade the left edge for it.
  const aboutRef = useRef(null)
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutRef, offset: ['start end', 'end start'] })
  const leftScrimOpacity = useTransform(aboutProgress, [0, 0.3, 0.75, 1], [0, 1, 1, 0])

  // The timeline sits on the right while the robot moves left: shade and frost the right edge.
  const resumeRef = useRef(null)
  const { scrollYProgress: resumeProgress } = useScroll({ target: resumeRef, offset: ['start end', 'start center'] })
  const rightScrimOpacity = useTransform(resumeProgress, [0, 1], [0, 0.55])
  const railOpacity = useTransform(resumeProgress, [0.3, 1], [0, 1])

  // 作品区蒙层：以作品区顶部从视口底进入到视口中部的进度，驱动 3D 渐暗
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({ target: worksRef, offset: ['start end', 'start center'] })
  const fogBg = useTransform(worksProgress, [0, 1], ['rgba(12, 12, 13, 0)', 'rgba(12, 12, 13, 0.5)'])

  // First-screen strip fades once the page moves.
  const stripOpacity = useTransform(scrollY, [0, 220], [1, 0])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      {/* 加载遮罩：模型全部加载完成前覆盖全屏，完成后淡出 */}
      <LoadingScreen />

      {/* 固定的 3D 背景 */}
      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0c0c0d']} />
          <Suspense fallback={null}>
            <Backdrop />
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <motion.div className="scrim scrim-left" style={{ opacity: leftScrimOpacity }} aria-hidden="true" />
      <motion.div className="scrim scrim-right" style={{ opacity: rightScrimOpacity }} aria-hidden="true" />
      <motion.div className="stage-fog" style={{ background: fogBg }} aria-hidden="true" />
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      <Nav />
      <HeroStrip opacity={stripOpacity} />

      {/* 全屏胶片噪点蒙层（multiply 混合） */}
      <NoiseOverlay />

      <main className="content">
        <Hero />
        <About innerRef={aboutRef} />
        <Resume innerRef={resumeRef} />
        <Works innerRef={worksRef} />
        <Contact />
      </main>
    </MotionConfig>
  )
}
