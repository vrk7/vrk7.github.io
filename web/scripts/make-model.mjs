// Generates public/models/me.glb: a placeholder robot bust with the camera animation
// and focus anchors that src/scene/Scene.tsx expects (see focusPoints.ts):
//   - a camera with an animation clip named `CameraAction` (24 fps)
//   - `focus-0` (hero), `focus-1…focus-N` (timeline), `focus-works`
//   - meshes named `eye-*` for the eye-follows-cursor effect
// Swap the output for a real character (e.g. exported from intro3d.com) whenever you like.
//
// Run from web/:  node scripts/make-model.mjs
import { writeFileSync } from 'node:fs'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// GLTFExporter reads Blobs through FileReader, which Node does not provide.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf
      this.onloadend?.()
    })
  }
}

const OUT = new URL('../public/models/me.glb', import.meta.url)
const FPS = 24
const FRAMES_PER_NODE = 50 // must match data/focusPoints.ts
const WORKS_ENTRANCE = 50 // must match Scene.tsx
const WORKS_PAN = 50
const FOV = 28
const ASPECT = 1.6 // framing is tuned for a 16:10 viewport

// ---------- materials ----------
const mat = {
  shell: new THREE.MeshStandardMaterial({ name: 'shell', color: '#ece5d6', roughness: 0.45, metalness: 0.05 }),
  accent: new THREE.MeshStandardMaterial({ name: 'accent', color: '#ff6b35', roughness: 0.4 }),
  screen: new THREE.MeshStandardMaterial({ name: 'screen', color: '#151a22', roughness: 0.15, metalness: 0.3 }),
  body: new THREE.MeshStandardMaterial({ name: 'body', color: '#2b3440', roughness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ name: 'metal', color: '#8a939e', roughness: 0.3, metalness: 0.8 }),
  eyeWhite: new THREE.MeshStandardMaterial({ name: 'eye-white', color: '#f5f3ee', roughness: 0.25 }),
  pupil: new THREE.MeshStandardMaterial({ name: 'pupil', color: '#0d0f13', roughness: 0.2 }),
  glow: new THREE.MeshStandardMaterial({
    name: 'glow',
    color: '#ffb070',
    emissive: '#ff9a4a',
    emissiveIntensity: 3,
  }),
  glint: new THREE.MeshStandardMaterial({ name: 'glint', color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 2 }),
  neuron: new THREE.MeshStandardMaterial({
    name: 'neuron',
    color: '#bff2ff',
    emissive: '#7fe3ff',
    emissiveIntensity: 2.5,
  }),
  synapse: new THREE.MeshStandardMaterial({
    name: 'synapse',
    color: '#cfe9f2',
    emissive: '#7fe3ff',
    emissiveIntensity: 0.6,
    roughness: 0.5,
  }),
}

function mesh(name, geometry, material, [x, y, z] = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material)
  m.name = name
  m.position.set(x, y, z)
  return m
}

// ---------- character ----------
const root = new THREE.Group()
root.name = 'root'

const HEAD = new THREE.Vector3(0, 1.6, 0)
root.add(mesh('head', new RoundedBoxGeometry(2.0, 1.7, 1.7, 6, 0.45), mat.shell, HEAD.toArray()))
root.add(mesh('face-screen', new RoundedBoxGeometry(1.6, 1.05, 0.12, 4, 0.05), mat.screen, [0, 1.62, 0.83]))

// Eyes: the eyeball rotates, the pupil and highlight are children so they move with it.
for (const [side, x] of [['L', -0.36], ['R', 0.36]]) {
  const eye = mesh(`eye-${side}`, new THREE.SphereGeometry(0.2, 32, 24), mat.eyeWhite, [x, 1.72, 0.93])
  // The pupil is a flattened sphere whose front pokes just past the eyeball surface.
  const pupil = mesh(`pupil-${side}`, new THREE.SphereGeometry(0.11, 24, 16), mat.pupil, [0, 0, 0.165])
  pupil.scale.set(1, 1, 0.45)
  eye.add(pupil)
  eye.add(mesh(`glint-${side}`, new THREE.SphereGeometry(0.025, 12, 8), mat.glint, [0.04, 0.05, 0.2]))
  root.add(eye)
}

const mouth = mesh('mouth', new THREE.TorusGeometry(0.16, 0.03, 12, 32, Math.PI), mat.glow, [0, 1.36, 0.92])
mouth.rotation.z = Math.PI
root.add(mouth)

for (const [side, x] of [['L', -1.07], ['R', 1.07]]) {
  const ear = mesh(`ear-${side}`, new THREE.CylinderGeometry(0.28, 0.28, 0.18, 40), mat.accent, [x, 1.6, 0])
  ear.rotation.z = Math.PI / 2
  ear.add(mesh(`ear-core-${side}`, new THREE.CylinderGeometry(0.16, 0.16, 0.24, 32), mat.screen))
  root.add(ear)
}

const antenna = mesh('antenna', new THREE.CylinderGeometry(0.03, 0.03, 0.5, 16), mat.metal, [0.33, 2.66, 0])
antenna.rotation.z = -0.12
root.add(antenna)
const BULB = new THREE.Vector3(0.36, 2.92, 0)
root.add(mesh('antenna-bulb', new THREE.SphereGeometry(0.1, 24, 16), mat.glow, BULB.toArray()))

root.add(mesh('neck', new THREE.CylinderGeometry(0.28, 0.32, 0.4, 32), mat.metal, [0, 0.6, 0]))
root.add(mesh('torso', new RoundedBoxGeometry(2.4, 1.2, 1.3, 6, 0.4), mat.body, [0, -0.05, 0]))
root.add(mesh('badge', new RoundedBoxGeometry(0.34, 0.22, 0.06, 3, 0.025), mat.accent, [0.6, 0.18, 0.66]))

// ---------- neuron cloud around the head ----------
// Deterministic pseudo-random so every run produces the same model.
let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

const neurons = []
while (neurons.length < 16) {
  const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
  if (dir.lengthSq() > 1 || dir.lengthSq() < 0.05) continue
  dir.normalize()
  if (dir.z > 0.55) continue // keep the face clear
  const p = dir.multiplyScalar(1.9 + rand() * 0.8).add(HEAD)
  if (p.y < 1.0) continue // stay above the shoulders
  neurons.push(p)
}
neurons.forEach((p, i) => {
  root.add(mesh(`neuron-${i}`, new THREE.SphereGeometry(0.05 + rand() * 0.05, 16, 12), mat.neuron, p.toArray()))
})

const linked = new Set()
const up = new THREE.Vector3(0, 1, 0)
neurons.forEach((a, i) => {
  const nearest = neurons
    .map((b, j) => ({ j, d: a.distanceTo(b) }))
    .filter(({ j }) => j !== i)
    .sort((x, y) => x.d - y.d)
    .slice(0, 2)
  for (const { j, d } of nearest) {
    const key = [i, j].sort().join('-')
    if (linked.has(key)) continue
    linked.add(key)
    const b = neurons[j]
    const link = mesh(`synapse-${key}`, new THREE.CylinderGeometry(0.008, 0.008, d, 6), mat.synapse)
    link.position.copy(a).add(b).multiplyScalar(0.5)
    link.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize())
    root.add(link)
  }
})

const nearestNeuron = (target) =>
  neurons.reduce((best, p) => (p.distanceTo(target) < best.distanceTo(target) ? p : best))

// ---------- camera path ----------
// Each shot: subject point, orbit angles around it, distance, and where the subject
// should land on screen (NDC, -1…1). The timeline text sits on the right half of the
// screen, so timeline shots push the subject to the left.
const shots = [
  // hero: subject sits right of centre, the name fills the left half
  { name: 'focus-0', p: new THREE.Vector3(0, 1.25, 0), az: -16, el: 3, dist: 11, sx: 0.44, sy: 0.1, dof: [3, 4] },
  // timeline: one shot per résumé entry, in the order of Resume.tsx
  { name: 'focus-1', p: new THREE.Vector3(0, 1.36, 0.92), az: 18, el: -14, dist: 5.2, sx: -0.4, sy: 0.02, dof: [9, 0.6] },
  { name: 'focus-2', p: new THREE.Vector3(-0.36, 1.72, 0.93), az: 22, el: 4, dist: 5.2, sx: -0.42, sy: 0, dof: [9, 0.5] },
  { name: 'focus-3', p: BULB, az: -35, el: 28, dist: 5, sx: -0.45, sy: 0.05, dof: [9, 0.6] },
  { name: 'focus-4', p: new THREE.Vector3(1.16, 1.6, 0), az: 82, el: 6, dist: 5.6, sx: -0.42, sy: 0, dof: [9, 0.6] },
  { name: 'focus-5', p: nearestNeuron(new THREE.Vector3(-1.4, 2.8, -0.6)), az: -60, el: 18, dist: 5.6, sx: -0.42, sy: 0, dof: [8, 0.8] },
  { name: 'focus-6', p: new THREE.Vector3(0.36, 1.72, 0.93), az: -24, el: -6, dist: 5.2, sx: -0.42, sy: 0, dof: [9, 0.5] },
  { name: 'focus-7', p: new THREE.Vector3(0.6, 0.18, 0.66), az: 30, el: -10, dist: 5.4, sx: -0.42, sy: 0.05, dof: [8, 0.7] },
  { name: 'focus-8', p: HEAD, az: -38, el: 8, dist: 7.5, sx: -0.45, sy: -0.05, dof: [5, 2] },
  // works: entrance (gallery slides up), then pan while the first card slides in
  { name: null, p: HEAD, az: -150, el: 10, dist: 7.5, sx: -0.5, sy: -0.05 },
  { name: 'focus-works', p: HEAD, az: 25, el: 6, dist: 8, sx: -0.8, sy: -0.05, dof: [5, 2] },
]
const M = shots.length - 3 // timeline stops (all shots minus hero and the two works shots)
shots.forEach((s, i) => {
  if (i <= M) s.frame = i * FRAMES_PER_NODE
  else s.frame = M * FRAMES_PER_NODE + (i === M + 1 ? WORKS_ENTRANCE : WORKS_ENTRANCE + WORKS_PAN)
})

const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
const lerpAngle = (a, b, t) => a + ((((b - a) % 360) + 540) % 360 - 180) * t

function poseAt(frame) {
  const i = Math.max(0, shots.findIndex((s, k) => k === shots.length - 1 || shots[k + 1].frame > frame))
  const a = shots[Math.min(i, shots.length - 1)]
  const b = shots[Math.min(i + 1, shots.length - 1)]
  const t = b.frame === a.frame ? 0 : THREE.MathUtils.clamp((frame - a.frame) / (b.frame - a.frame), 0, 1)
  const p = a.p.clone().lerp(b.p, t)
  const az = THREE.MathUtils.degToRad(lerpAngle(a.az, b.az, t))
  const el = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(a.el, b.el, t))
  const dist = THREE.MathUtils.lerp(a.dist, b.dist, t)
  const sx = THREE.MathUtils.lerp(a.sx, b.sx, t)
  const sy = THREE.MathUtils.lerp(a.sy, b.sy, t)

  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
  const cam = new THREE.PerspectiveCamera(FOV, ASPECT)
  cam.position.copy(p).addScaledVector(dir, dist)
  cam.lookAt(p)
  // Truck the camera so the subject lands at (sx, sy) on screen.
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion)
  const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion)
  cam.position
    .addScaledVector(right, -sx * dist * tanHalf * ASPECT)
    .addScaledVector(camUp, -sy * dist * tanHalf)
  return { position: cam.position, quaternion: cam.quaternion }
}

const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.1, 200)
camera.name = 'Camera'
root.add(camera)

const lastFrame = shots[shots.length - 1].frame
const times = []
const positions = []
const quaternions = []
let prevQuat = null
for (let f = 0; f <= lastFrame; f++) {
  const { position, quaternion } = poseAt(f)
  // Keep quaternions in one hemisphere so interpolation never flips the long way round.
  if (prevQuat && prevQuat.dot(quaternion) < 0) quaternion.set(-quaternion.x, -quaternion.y, -quaternion.z, -quaternion.w)
  prevQuat = quaternion.clone()
  times.push(f / FPS)
  positions.push(...position.toArray())
  quaternions.push(...quaternion.toArray())
}
const clip = new THREE.AnimationClip('CameraAction', lastFrame / FPS, [
  new THREE.VectorKeyframeTrack('Camera.position', times, positions),
  new THREE.QuaternionKeyframeTrack('Camera.quaternion', times, quaternions),
])
const initial = poseAt(0)
camera.position.copy(initial.position)
camera.quaternion.copy(initial.quaternion)

// Focus anchors (empties). Per-anchor depth of field goes into glTF extras, which
// Scene.tsx reads as dofBokeh / dofFocusRange.
for (const s of shots) {
  if (!s.name) continue
  const anchor = new THREE.Object3D()
  anchor.name = s.name
  anchor.position.copy(s.p)
  anchor.userData = { dofBokeh: s.dof[0], dofFocusRange: s.dof[1] }
  root.add(anchor)
}

const scene = new THREE.Scene()
scene.add(root)

const glb = await new GLTFExporter().parseAsync(scene, { binary: true, animations: [clip] })
writeFileSync(OUT, Buffer.from(glb))
console.log(`wrote ${OUT.pathname} (${(glb.byteLength / 1024).toFixed(0)} KB, ${lastFrame} frames)`)
