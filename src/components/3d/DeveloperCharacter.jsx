import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Front-facing 3D cartoon developer, modelled after the reference art:
 * large swept hair, big expressive eyes, rosy cheeks, open brown hoodie over a
 * black tee. Everything is procedural Three.js geometry, animated by a small rig:
 *
 *   spine ─ neck ─ head ─ eyes (iris gaze, blinking lids) / brows / mouth
 *   arms  ─ 2-bone IK (shoulder → elbow → wrist) driven by hand targets
 *   hands ─ per-finger curl for typing taps and an open-palm wave
 *
 * Inputs (all live refs, no re-renders):
 *   anim.current   { look, wave, smile, typing }  0..1, tweened by GSAP in Hero.jsx
 *   onActivity(v)  reports typing activity 0..1 so the monitor code types along
 *
 * Character local space: he faces +Z (the camera); +X is the viewer's right.
 */

// Change these to tweak the look.
export const LOOK = {
  skin: '#e2a982',
  skinShade: '#cc8d6a',
  ear: '#dc9878',
  blush: '#f08f84',
  hair: '#2a1c15',
  hoodie: '#4a3a2f',
  hoodieDark: '#3a2d24',
  tee: '#0d0d10',
  iris: '#5a4033',
  brow: '#24170f',
}

/* ── helpers ───────────────────────────────────────────── */
const deg = THREE.MathUtils.degToRad
const lerp = THREE.MathUtils.lerp
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
/** spherical → cartesian on the head (azimuth from front toward +X, elevation up) */
const sph = (az, el, r) => [r * Math.cos(deg(el)) * Math.sin(deg(az)), r * Math.sin(deg(el)), r * Math.cos(deg(el)) * Math.cos(deg(az))]

/**
 * A tapered, slightly flattened hair lock along a smooth curve.
 * Thick near the root, pointed at the tip, flatter against the scalp.
 */
function lockGeometry(points, radius, flatten = 0.42, tipPower = 1.7) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
  const SEG = 28
  const RAD = 10
  const g = new THREE.TubeGeometry(curve, SEG, radius, RAD, false)
  const pos = g.attributes.position
  const v = new THREE.Vector3()
  const c = new THREE.Vector3()
  const d = new THREE.Vector3()
  const n = new THREE.Vector3()
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG
    curve.getPointAt(t, c)
    const k = Math.max(0.04, smooth(t / 0.16) * (1 - Math.pow(t, tipPower)))
    n.copy(c).normalize() // radial direction from the head centre
    for (let j = 0; j <= RAD; j++) {
      const idx = i * (RAD + 1) + j
      v.fromBufferAttribute(pos, idx)
      d.subVectors(v, c)
      const dr = d.dot(n)
      d.addScaledVector(n, -dr * (1 - flatten)).multiplyScalar(k)
      v.copy(c).add(d)
      pos.setXYZ(idx, v.x, v.y, v.z)
    }
  }
  g.computeVertexNormals()
  return g
}

/* Hair design: [az°, el°, radius] control points per lock + thickness. */
const H = 0.2 // skull radius
const LOCKS = [
  // fringe — sweeps from the crown across the forehead toward the viewer's right
  { pts: [[-35, 72, 0.2], [-14, 54, 0.236], [10, 36, 0.24], [32, 18, 0.23], [48, 4, 0.214]], r: 0.054 },
  { pts: [[-55, 68, 0.2], [-34, 50, 0.236], [-10, 33, 0.236], [14, 19, 0.226], [27, 9, 0.214]], r: 0.048 },
  { pts: [[-75, 60, 0.2], [-58, 44, 0.232], [-40, 30, 0.23], [-22, 20, 0.22], [-8, 14, 0.212]], r: 0.042 },
  { pts: [[5, 78, 0.2], [24, 58, 0.244], [44, 40, 0.238], [62, 24, 0.228], [74, 10, 0.212]], r: 0.052 },
  { pts: [[-20, 80, 0.21], [2, 60, 0.256], [24, 43, 0.25], [42, 30, 0.238], [55, 18, 0.224]], r: 0.056 },
  // volume on top
  { pts: [[-95, 58, 0.2], [-40, 78, 0.262], [30, 74, 0.264], [85, 56, 0.248], [118, 44, 0.226]], r: 0.07 },
  { pts: [[-125, 52, 0.2], [-70, 76, 0.256], [0, 84, 0.266], [70, 72, 0.254], [135, 56, 0.23]], r: 0.07 },
  { pts: [[-150, 40, 0.2], [-120, 68, 0.24], [-60, 84, 0.248], [60, 84, 0.246], [150, 62, 0.226]], r: 0.06 },
  // sides — swept back over the ears
  { pts: [[-58, 44, 0.215], [-78, 28, 0.226], [-92, 12, 0.222], [-99, -3, 0.212]], r: 0.042 },
  { pts: [[-105, 48, 0.215], [-114, 28, 0.226], [-120, 8, 0.218], [-120, -8, 0.206]], r: 0.046 },
  { pts: [[78, 46, 0.215], [90, 28, 0.228], [97, 10, 0.222], [99, -4, 0.212]], r: 0.046 },
  { pts: [[112, 50, 0.215], [118, 30, 0.226], [122, 8, 0.218], [119, -7, 0.206]], r: 0.046 },
  // back
  { pts: [[150, 70, 0.2], [155, 45, 0.228], [158, 15, 0.225], [160, -15, 0.21]], r: 0.066 },
  { pts: [[180, 72, 0.2], [180, 45, 0.23], [180, 15, 0.226], [180, -18, 0.21]], r: 0.068 },
  { pts: [[-150, 70, 0.2], [-155, 45, 0.228], [-158, 15, 0.225], [-160, -15, 0.21]], r: 0.066 },
  { pts: [[-125, 64, 0.2], [-132, 40, 0.226], [-136, 12, 0.222], [-136, -12, 0.208]], r: 0.056 },
  { pts: [[128, 64, 0.2], [134, 40, 0.226], [138, 12, 0.222], [138, -12, 0.208]], r: 0.056 },
]

function useMaterials() {
  return useMemo(() => {
    const std = (color, roughness = 0.6, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness })
    return {
      skin: new THREE.MeshPhysicalMaterial({ color: LOOK.skin, roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#ffd7c4'), sheenRoughness: 0.5 }),
      skinShade: std(LOOK.skinShade, 0.55),
      ear: new THREE.MeshPhysicalMaterial({ color: LOOK.ear, roughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color('#ffc6b4') }),
      blush: new THREE.MeshBasicMaterial({ color: LOOK.blush, transparent: true, opacity: 0.32, depthWrite: false }),
      hair: new THREE.MeshPhysicalMaterial({ color: LOOK.hair, roughness: 0.42, sheen: 0.9, sheenColor: new THREE.Color('#8a6a55'), sheenRoughness: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
      brow: std(LOOK.brow, 0.8),
      sclera: new THREE.MeshPhysicalMaterial({ color: '#fbf8f5', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }),
      iris: new THREE.MeshPhysicalMaterial({ color: LOOK.iris, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }),
      pupil: new THREE.MeshPhysicalMaterial({ color: '#0d0a09', roughness: 0.2, clearcoat: 1 }),
      glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      lash: std('#140d0a', 0.5),
      mouth: std('#7e3a32', 0.5),
      mouthIn: std('#5a1f1c', 0.7),
      teeth: std('#fbf7f2', 0.35),
      hoodie: new THREE.MeshPhysicalMaterial({ color: LOOK.hoodie, roughness: 0.9, sheen: 0.7, sheenColor: new THREE.Color('#8c7462'), sheenRoughness: 0.75 }),
      hoodieDark: new THREE.MeshPhysicalMaterial({ color: LOOK.hoodieDark, roughness: 0.92, sheen: 0.5, sheenColor: new THREE.Color('#6d5747') }),
      tee: new THREE.MeshStandardMaterial({ color: LOOK.tee, roughness: 0.95 }),
      cord: std('#2b211b', 0.7),
      aglet: std('#8d8f94', 0.3, 0.7),
      watch: std('#16191e', 0.35, 0.4),
    }
  }, [])
}

const Ball = ({ r, mat, seg = 32, ...p }) => (
  <mesh material={mat} {...p}>
    <sphereGeometry args={[r, seg, seg]} />
  </mesh>
)

/* ── Eye: unit-ish sclera inside a squashed group so lids & gaze follow it ── */
function Eye({ m, side, irisRef, lidRef }) {
  const R = 0.058
  return (
    <group position={[0.084 * side, -0.016, 0.146]} rotation={[0, 0.22 * side, 0]} scale={[1, 1.12, 0.58]}>
      <Ball r={R} mat={m.sclera} seg={32} />
      {/* iris rotates around the eye centre, so it always sits on the eyeball */}
      <group ref={irisRef}>
        <Ball r={0.042} mat={m.iris} position={[0, -0.003, 0.023]} seg={28} />
        <Ball r={0.022} mat={m.pupil} position={[0, -0.003, 0.043]} seg={20} />
        <Ball r={0.011} mat={m.glint} position={[0.015 * side, 0.016, 0.058]} seg={12} />
        <Ball r={0.005} mat={m.glint} position={[-0.013 * side, -0.016, 0.062]} seg={10} />
      </group>
      {/* upper lid (skin shell) + lash line; rotating forward closes the eye */}
      <group ref={lidRef}>
        <mesh material={m.skin}>
          <sphereGeometry args={[R * 1.07, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={m.lash} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R * 1.07, 0.0065, 8, 32, Math.PI]} />
        </mesh>
        {/* outer flick */}
        <mesh material={m.lash} position={[R * 1.02 * side, 0.004, 0.012]} rotation={[0, 0, 0.5 * side]}>
          <capsuleGeometry args={[0.004, 0.014, 4, 8]} />
        </mesh>
      </group>
      {/* subtle lower lid line */}
      <mesh material={m.skinShade} rotation={[-Math.PI / 2 + 0.55, 0, Math.PI]}>
        <torusGeometry args={[R * 1.02, 0.0028, 6, 28, Math.PI * 0.8]} />
      </mesh>
    </group>
  )
}

function Head({ m, refs }) {
  const hairGeos = useMemo(() => LOCKS.map((l) => lockGeometry(l.pts.map(([a, e, r]) => sph(a, e, r)), l.r)), [])
  useEffect(() => () => hairGeos.forEach((g) => g.dispose()), [hairGeos])
  return (
    <group>
      {/* skull + soft lower face (cheeks/jaw) */}
      <Ball r={H} mat={m.skin} scale={[1, 0.97, 0.94]} seg={56} />
      <Ball r={0.17} mat={m.skin} position={[0, -0.066, 0.026]} scale={[1.02, 0.9, 0.95]} seg={48} />
      {/* ears */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.192 * s, -0.035, -0.01]} rotation={[0, 0.25 * s, 0]}>
          <Ball r={0.052} mat={m.ear} scale={[0.42, 1, 0.78]} />
          <Ball r={0.03} mat={m.skinShade} position={[0.009 * s, -0.002, 0.008]} scale={[0.35, 0.85, 0.6]} />
        </group>
      ))}

      {/* hair: scalp caps + tapered locks */}
      <mesh material={m.hair} rotation={[-0.45, 0, 0]}>
        <sphereGeometry args={[0.212, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      <mesh material={m.hair} position={[0, -0.005, -0.012]}>
        <sphereGeometry args={[0.209, 48, 24, Math.PI, Math.PI, 0, Math.PI * 0.62]} />
      </mesh>
      {hairGeos.map((g, i) => (
        <mesh key={i} geometry={g} material={m.hair} />
      ))}

      {/* eyes */}
      <Eye m={m} side={-1} irisRef={refs.irisR} lidRef={refs.lidR} />
      <Eye m={m} side={1} irisRef={refs.irisL} lidRef={refs.lidL} />

      {/* brows */}
      <group ref={refs.brows}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.brow} position={[0.086 * s, 0.072, 0.166]} rotation={[-0.2, 0.28 * s, Math.PI / 2 - 0.1 * s]}>
            <capsuleGeometry args={[0.012, 0.066, 6, 12]} />
          </mesh>
        ))}
      </group>

      {/* nose */}
      <Ball r={0.014} mat={m.skin} position={[0, -0.066, 0.184]} scale={[1.15, 0.8, 0.9]} />
      <Ball r={0.007} mat={m.skinShade} position={[0, -0.074, 0.187]} scale={[1.8, 0.6, 0.6]} />

      {/* cheeks */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.blush} position={[0.122 * s, -0.07, 0.136]} rotation={[0, 0.65 * s, 0]} scale={[1, 0.65, 0.25]}>
          <sphereGeometry args={[0.042, 20, 12]} />
        </mesh>
      ))}

      {/* mouth: closed smile + open smile (cross-faded) */}
      <group position={[0, -0.108, 0.176]} rotation={[0.22, 0, 0]}>
        <group ref={refs.smileClosed}>
          <mesh material={m.mouth} rotation={[0, 0, Math.PI + 0.12 * Math.PI]}>
            <torusGeometry args={[0.03, 0.0048, 8, 24, Math.PI * 0.76]} />
          </mesh>
        </group>
        <group ref={refs.smileOpen} position={[0, 0.006, 0.002]} scale={0.001}>
          <mesh material={m.mouthIn}>
            <shapeGeometry args={[openSmileShape(0.038, 0.028)]} />
          </mesh>
          <mesh material={m.teeth} position={[0, -0.0045, 0.0005]}>
            <shapeGeometry args={[teethShape(0.031, 0.008)]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function openSmileShape(w, h) {
  const s = new THREE.Shape()
  s.moveTo(-w, 0)
  s.quadraticCurveTo(0, 0.006, w, 0)
  s.absellipse(0, 0, w, h, 0, Math.PI, true)
  return s
}
function teethShape(w, h) {
  const s = new THREE.Shape()
  s.moveTo(-w, 0.004)
  s.quadraticCurveTo(0, 0.0085, w, 0.004)
  s.lineTo(w * 0.92, -h)
  s.quadraticCurveTo(0, -h * 0.6, -w * 0.92, -h)
  s.closePath()
  return s
}

/* ── Hand: fingers along local -Y, palm toward local -Z ── */
function Hand({ m, side, fingers }) {
  const F = [
    { x: -0.024, len: 0.04 },
    { x: -0.008, len: 0.046 },
    { x: 0.008, len: 0.044 },
    { x: 0.023, len: 0.036 },
  ]
  return (
    <group>
      <RoundedBox args={[0.074, 0.074, 0.032]} radius={0.014} smoothness={3} material={m.skin} position={[0, -0.04, 0]} />
      {F.map((f, i) => (
        <group key={i} position={[f.x * -side, -0.076, 0]} ref={(el) => (fingers.current[i] = el)}>
          <mesh material={m.skin} position={[0, -f.len / 2, 0]}>
            <capsuleGeometry args={[0.0088, f.len - 0.014, 4, 10]} />
          </mesh>
        </group>
      ))}
      <group position={[0.04 * -side, -0.028, -0.006]} rotation={[0.35, 0, 0.8 * side]}>
        <mesh material={m.skin} position={[0, -0.02, 0]}>
          <capsuleGeometry args={[0.01, 0.026, 4, 10]} />
        </mesh>
      </group>
    </group>
  )
}

/* ── 2-bone IK helpers ── */
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _c = new THREE.Vector3()
const _m = new THREE.Matrix4()
function solveElbow(S, T, A, B, pole, out) {
  _a.subVectors(T, S)
  let d = _a.length()
  d = Math.min(Math.max(d, 1e-4), A + B - 1e-4)
  _a.normalize()
  const along = (A * A - B * B + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, A * A - along * along))
  _b.copy(pole).addScaledVector(_a, -pole.dot(_a)).normalize()
  return out.copy(S).addScaledVector(_a, along).addScaledVector(_b, h)
}
/** orient object so local -Y points from P to Q, local -Z roughly along `palm` */
function aim(obj, P, Q, palm) {
  const Y = _a.subVectors(P, Q).normalize() // -Y toward Q
  const Z = _b.copy(palm).multiplyScalar(-1)
  Z.addScaledVector(Y, -Z.dot(Y)).normalize()
  const X = _c.crossVectors(Y, Z)
  _m.makeBasis(X, Y, Z)
  obj.position.copy(P)
  obj.quaternion.setFromRotationMatrix(_m)
}

function useArm() {
  return { upper: useRef(), fore: useRef(), hand: useRef(), fingers: useRef([]), E: useMemo(() => new THREE.Vector3(), []) }
}

const UPPER = 0.27
const FORE = 0.27

export default function DeveloperCharacter({ anim, reduced, onActivity }) {
  const m = useMaterials()
  const root = useRef()
  const spine = useRef()
  const neck = useRef()
  const head = useRef()
  const refs = {
    irisL: useRef(),
    irisR: useRef(),
    lidL: useRef(),
    lidR: useRef(),
    brows: useRef(),
    smileClosed: useRef(),
    smileOpen: useRef(),
  }
  const R = useArm() // character's right (viewer's left, -X) — the waving arm
  const L = useArm()
  const sim = useRef({ mode: 'type', until: 6, pause: 0, blinkAt: 2.2, blinkT: -1, double: false, seed: Math.random() * 10 })

  // reusable vectors
  const v = useMemo(
    () => ({
      S: new THREE.Vector3(),
      T: new THREE.Vector3(),
      W: new THREE.Vector3(),
      pole: new THREE.Vector3(),
      palm: new THREE.Vector3(),
      tmp: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    root.current.traverse((o) => {
      if (o.isMesh && o.material !== m.blush) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [m])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    const t = state.clock.elapsedTime
    const a = anim.current
    const motion = reduced ? 0 : 1
    const s = sim.current

    /* typing ↔ thinking pauses (random, so it never loops mechanically) */
    if (motion && t > s.until) {
      if (s.mode === 'type') {
        s.mode = 'think'
        s.until = t + 1.1 + Math.random() * 1.3
      } else {
        s.mode = 'type'
        s.until = t + 4 + Math.random() * 5
      }
    }
    s.pause = THREE.MathUtils.damp(s.pause, s.mode === 'think' ? 1 : 0, 4, dt)
    const typing = a.typing * (1 - a.wave) * (1 - s.pause * 0.9) * motion
    onActivity?.(a.typing * (1 - s.pause) * motion)

    const look = a.look // 1 = looking at the visitor
    const think = s.pause * (1 - look) * a.typing * motion
    const breath = Math.sin(t * 1.5) * motion

    /* body */
    spine.current.position.y = breath * 0.004
    spine.current.rotation.z = a.wave * 0.035
    spine.current.rotation.x = lerp(0.06, -0.01, look) + think * -0.02

    /* head + gaze */
    const drift = motion * (1 - look) * (1 - think)
    neck.current.rotation.set(lerp(0.1, -0.02, look), 0, 0)
    head.current.rotation.set(
      lerp(0.16, -0.05, look) + Math.sin(t * 0.8 + s.seed) * 0.02 * drift - think * 0.12,
      Math.sin(t * 0.37 + s.seed) * 0.07 * drift + think * -0.2 + look * Math.sin(t * 1.1) * 0.015,
      Math.sin(t * 0.55) * 0.02 * drift + think * 0.07 + a.wave * -0.06,
    )
    const gazeX = lerp(0.24, 0.0, look) - think * 0.5
    const gazeY = Math.sin(t * 0.9) * 0.05 * drift * typing - think * 0.35
    refs.irisL.current.rotation.set(gazeX, gazeY, 0)
    refs.irisR.current.rotation.set(gazeX, gazeY, 0)

    /* blink (random, sometimes double) */
    let blink = 0
    if (motion) {
      if (t > s.blinkAt && s.blinkT < 0) s.blinkT = 0
      if (s.blinkT >= 0) {
        s.blinkT += dt
        const p = s.blinkT / 0.15
        blink = p < 0.5 ? p * 2 : Math.max(0, 2 - p * 2)
        if (p >= 1) {
          s.blinkT = -1
          if (!s.double && Math.random() < 0.2) {
            s.double = true
            s.blinkAt = t + 0.12
          } else {
            s.double = false
            s.blinkAt = t + 2.4 + Math.random() * 3.2
          }
        }
      }
    }
    // lids: slightly lower when looking down at the laptop
    const lidOpen = lerp(-0.42, -0.92, look) + a.smile * 0.12 + think * -0.15
    const lid = lerp(lidOpen, 1.5, blink)
    refs.lidL.current.rotation.x = lid
    refs.lidR.current.rotation.x = lid

    refs.brows.current.position.y = a.smile * 0.01 + look * 0.004 + think * 0.006

    /* mouth */
    const open = a.smile
    refs.smileOpen.current.scale.setScalar(Math.max(0.001, smooth(open)))
    refs.smileClosed.current.scale.setScalar(Math.max(0.001, 1 - smooth(open * 1.4)))
    refs.smileClosed.current.scale.x *= 1 + typing * 0.03

    /* arms (IK). Shoulders in character space. */
    const sy = 1.05 + breath * 0.004
    // typing targets: wrists at the laptop's front corners
    const typeTarget = (side, out) => {
      const tap = typing * 0.008 * Math.sin(t * (side > 0 ? 9.3 : 10.7) + side)
      return out.set(0.205 * side, 0.79 + Math.max(0, tap) + s.pause * 0.012 * motion, 0.43)
    }
    // ── character's right arm: types, or waves when anim.wave > 0
    v.S.set(-0.245, sy + a.wave * 0.02, 0.0)
    typeTarget(-1, v.T)
    const waveSwing = Math.sin(t * 8.5) * 0.055 * motion
    v.W.set(-0.47 + waveSwing * a.wave, 1.36, 0.2)
    v.T.lerp(v.W, smooth(a.wave))
    v.pole.set(lerp(-0.7, -1, a.wave), lerp(-0.6, -0.35, a.wave), lerp(-0.4, -0.1, a.wave))
    solveElbow(v.S, v.T, UPPER, FORE, v.pole, R.E)
    v.palm.set(0, -1, 0).lerp(v.tmp.set(0, 0, 1), smooth(a.wave)).normalize()
    aim(R.upper.current, v.S, R.E, v.palm)
    aim(R.fore.current, R.E, v.T, v.palm)
    // hand continues the forearm, bent slightly down while typing, upright while waving
    v.tmp.subVectors(v.T, R.E).normalize()
    v.tmp.y -= 0.35 * (1 - a.wave)
    v.tmp.x += waveSwing * 2.2 * a.wave
    v.tmp.normalize()
    aim(R.hand.current, v.T, v.W.copy(v.T).add(v.tmp), v.palm)

    // ── character's left arm: always at the keyboard
    v.S.set(0.245, sy, 0.0)
    typeTarget(1, v.T)
    v.pole.set(0.7, -0.6, -0.4)
    solveElbow(v.S, v.T, UPPER, FORE, v.pole, L.E)
    v.palm.set(0, -1, 0)
    aim(L.upper.current, v.S, L.E, v.palm)
    aim(L.fore.current, L.E, v.T, v.palm)
    v.tmp.subVectors(v.T, L.E).normalize()
    v.tmp.y -= 0.35
    v.tmp.normalize()
    aim(L.hand.current, v.T, v.W.copy(v.T).add(v.tmp), v.palm)

    /* fingers: irregular taps while typing, spread while waving */
    const fingers = (arm, side, waveW) => {
      arm.fingers.current.forEach((f, i) => {
        if (!f) return
        const ph = i * 2.1 + (side > 0 ? 0.7 : 0) + s.seed
        const n = Math.sin(t * (11 + i * 1.3) + ph) + 0.6 * Math.sin(t * (4.3 + i) + ph * 1.7)
        const tap = Math.pow(Math.max(0, n / 1.6), 3) * 0.9 * typing
        f.rotation.x = lerp(0.55 + s.pause * 0.15, 0.08, waveW) + tap
        f.rotation.z = (i - 1.5) * 0.09 * waveW * -side
      })
    }
    fingers(R, -1, smooth(a.wave))
    fingers(L, 1, 0)
  })

  const Sleeve = ({ len, r }) => (
    <mesh material={m.hoodie} position={[0, -len / 2, 0]}>
      <capsuleGeometry args={[r, len, 8, 20]} />
    </mesh>
  )

  const arm = (A, side) => (
    <group key={side}>
      <group ref={A.upper}>
        <Ball r={0.078} mat={m.hoodie} />
        <Sleeve len={UPPER} r={0.064} />
      </group>
      <group ref={A.fore}>
        <Ball r={0.062} mat={m.hoodie} />
        <Sleeve len={FORE - 0.03} r={0.056} />
        <mesh material={m.hoodieDark} position={[0, -FORE + 0.012, 0]}>
          <cylinderGeometry args={[0.05, 0.053, 0.04, 20]} />
        </mesh>
        {side > 0 && (
          <mesh material={m.watch} position={[0, -FORE - 0.008, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.014, 20]} />
          </mesh>
        )}
      </group>
      <group ref={A.hand}>
        <group scale={1.3}>
          <Hand m={m} side={side} fingers={A.fingers} />
        </group>
      </group>
    </group>
  )

  return (
    <group ref={root}>
      <group ref={spine}>
        {/* hoodie torso */}
        <mesh material={m.hoodie} geometry={TORSO} scale={[1, 1, 0.62]} />
        {/* black tee in the open front + neckline */}
        <RoundedBox args={[0.122, 0.27, 0.012]} radius={0.005} smoothness={2} material={m.tee} position={[0, 0.985, 0.148]} />
        {/* hoodie front edges */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.hoodieDark} position={[0.071 * s, 0.98, 0.152]} rotation={[0, 0.16 * s, 0]}>
            <boxGeometry args={[0.024, 0.29, 0.018]} />
          </mesh>
        ))}
        {/* chest pocket */}
        <group position={[0.132, 0.965, 0.13]} rotation={[0, 0.38, 0]}>
          <RoundedBox args={[0.095, 0.07, 0.012]} radius={0.004} smoothness={2} material={m.hoodieDark} />
          <mesh material={m.hoodie} position={[0, 0.03, 0.008]}>
            <boxGeometry args={[0.1, 0.018, 0.01]} />
          </mesh>
        </group>
        {/* hood around the neck */}
        <mesh material={m.hoodie} position={[0, 1.15, -0.03]} rotation={[Math.PI / 2 - 0.32, 0, 0]} scale={[1.12, 1, 1]}>
          <torusGeometry args={[0.13, 0.05, 14, 36]} />
        </mesh>
        <Ball r={0.13} mat={m.hoodie} position={[0, 1.17, -0.14]} scale={[1.25, 0.8, 0.6]} />
        {/* drawstrings */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0.052 * s, 1.07, 0.16]} rotation={[0.08, 0, 0.03 * s]}>
            <mesh material={m.cord} position={[0, -0.06, 0]}>
              <capsuleGeometry args={[0.0055, 0.12, 4, 8]} />
            </mesh>
            <mesh material={m.aglet} position={[0, -0.13, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.018, 8]} />
            </mesh>
          </group>
        ))}

        {/* neck + head */}
        <group ref={neck} position={[0, 1.13, 0.0]}>
          <mesh material={m.skin} position={[0, 0.04, 0]}>
            <capsuleGeometry args={[0.058, 0.05, 8, 16]} />
          </mesh>
          <group ref={head} position={[0, 0.235, 0.018]}>
            <Head m={m} refs={refs} />
          </group>
        </group>
      </group>

      {arm(R, -1)}
      {arm(L, 1)}
    </group>
  )
}

/* torso lathe (radius, height) — sloped shoulders, soft chest, straight waist */
const TORSO = (() => {
  const P = [
    [0, 0.55],
    [0.2, 0.55],
    [0.212, 0.65],
    [0.218, 0.8],
    [0.232, 0.92],
    [0.246, 1.0],
    [0.25, 1.045],
    [0.236, 1.09],
    [0.19, 1.125],
    [0.11, 1.145],
    [0, 1.15],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const g = new THREE.LatheGeometry(P, 48)
  g.computeVertexNormals()
  return g
})()
