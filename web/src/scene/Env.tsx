import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'

// Image-based lighting from three's procedural RoomEnvironment. It replaces the
// template's env.hdr file, whose license was unclear, and needs no download.
export default function Env({ intensity }: { intensity: number }) {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    scene.environment = target.texture
    return () => {
      scene.environment = null
      target.dispose()
      room.dispose()
      pmrem.dispose()
    }
  }, [scene, gl])

  useEffect(() => {
    scene.environmentIntensity = intensity
  }, [scene, intensity])

  return null
}
