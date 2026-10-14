import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import DeveloperCharacter from './DeveloperCharacter.jsx'
import { createCodeScreen } from './codeScreen.js'

/**
 * Hero workspace, composed after the reference art: the developer sits behind a
 * wooden desk, laptop lid facing the visitor; behind him a bright window with
 * blinds, a monitor showing live code, shelves and plants; a desk lamp, a
 * steaming mug and a stack of books in the foreground.
 *
 * World units ≈ metres. Character root sits at z = -0.45 facing +Z (camera).
 */

const WALL = '#d9d2c8'
const FOG = '#e4ddd3'
const CHAR_Z = -0.45

/* ── environment & camera ─────────────────────────────── */
function StudioEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.35
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

const TARGET = new THREE.Vector3(0, 1.15, -0.3)
function CameraRig({ pointerRef, compact }) {
  const { camera, size } = useThree()
  useFrame((_, dt) => {
    const px = pointerRef?.current?.x ?? 0
    const py = pointerRef?.current?.y ?? 0
    // keep the character's full width in frame on narrow (portrait) cards
    const aspect = size.width / size.height
    const back = aspect < 0.95 ? (0.95 - aspect) * 2.2 : 0
    const tx = px * 0.08
    const ty = 1.58 - py * 0.05
    const tz = 3.15 + back + (compact ? 0.1 : 0)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 2.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 2.5, dt)
    camera.lookAt(TARGET)
  })
  return null
}

/* ── small material cache ── */
function useMats() {
  return useMemo(() => {
    const std = (color, roughness = 0.6, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness })
    return {
      wall: std(WALL, 0.95),
      wood: new THREE.MeshStandardMaterial({ color: '#a8774f', roughness: 0.62 }),
      woodEdge: std('#966743', 0.55),
      woodBack: std('#b88a62', 0.6),
      white: std('#f3f1ed', 0.5),
      dark: std('#202227', 0.45),
      charcoal: std('#2c2e33', 0.4, 0.3),
      chair: std('#3b3e44', 0.9),
      lid: new THREE.MeshPhysicalMaterial({ color: '#3a3431', roughness: 0.32, metalness: 0.65, clearcoat: 0.4 }),
      pot: std('#ece7df', 0.6),
      potDark: std('#6f6a64', 0.6),
      leaf: std('#4f8a59', 0.55),
      leafDark: std('#3b7048', 0.6),
      soil: std('#3a2a20', 1),
      mug: new THREE.MeshPhysicalMaterial({ color: '#2f5b43', roughness: 0.3, clearcoat: 0.6 }),
      coffee: std('#3d2416', 0.2),
      book1: std('#2d3a52', 0.7),
      book2: std('#5b4a3d', 0.7),
      book3: std('#1f2329', 0.7),
      paper: std('#f6f3ec', 0.9),
      note: std('#f6ecc4', 0.9),
      noteB: std('#e9eefc', 0.9),
      blind: new THREE.MeshStandardMaterial({ color: '#eef1f5', roughness: 0.6, emissive: '#ffffff', emissiveIntensity: 0.25 }),
      windowGlow: new THREE.MeshBasicMaterial({ color: '#f7faff', toneMapped: false }),
      lampShade: std('#16181c', 0.35, 0.4),
      lampGlow: new THREE.MeshBasicMaterial({ color: '#fff1d6', toneMapped: false }),
      figurine: std('#f5f3ef', 0.4),
      cactus: std('#5d8f56', 0.6),
    }
  }, [])
}

/* ── room ── */
function Room({ m, monitor }) {
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: monitor.texture, toneMapped: false, color: new THREE.Color(0.86, 0.86, 0.86) }), [monitor])
  return (
    <group>
      {/* back wall + side wall */}
      <mesh material={m.wall} position={[0, 2, -2.1]} receiveShadow>
        <planeGeometry args={[9, 5]} />
      </mesh>
      <mesh material={m.wall} position={[-2.2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 5]} />
      </mesh>

      {/* window with blinds (behind the developer, slightly left) */}
      <group position={[-0.3, 1.78, -2.08]}>
        <mesh material={m.white} position={[0, 0, -0.01]}>
          <boxGeometry args={[1.86, 1.66, 0.02]} />
        </mesh>
        <mesh material={m.windowGlow} position={[0, 0, 0.005]}>
          <planeGeometry args={[1.74, 1.54]} />
        </mesh>
        {Array.from({ length: 17 }).map((_, i) => (
          <mesh key={i} material={m.blind} position={[0, 0.72 - i * 0.09, 0.04]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[1.74, 0.05, 0.004]} />
          </mesh>
        ))}
      </group>

      {/* shelves (left) */}
      {[1.5, 1.05].map((y, i) => (
        <group key={y} position={[-1.55, y, -1.95]}>
          <mesh material={m.woodBack} castShadow>
            <boxGeometry args={[0.8, 0.03, 0.26]} />
          </mesh>
          {i === 0 ? (
            <>
              <Plant m={m} position={[-0.18, 0.015, 0]} scale={0.8} />
              <group position={[0.18, 0.015, 0]}>
                <Ball r={0.05} m={m.figurine} position={[0, 0.05, 0]} />
                <Ball r={0.042} m={m.figurine} position={[0, 0.125, 0]} />
                <Ball r={0.009} m={m.dark} position={[-0.016, 0.13, 0.038]} />
                <Ball r={0.009} m={m.dark} position={[0.016, 0.13, 0.038]} />
              </group>
            </>
          ) : (
            <>
              {[0, 1, 2].map((k) => (
                <mesh key={k} material={[m.book1, m.book2, m.book3][k]} position={[-0.25 + k * 0.045, 0.11, 0]}>
                  <boxGeometry args={[0.04, 0.2, 0.17]} />
                </mesh>
              ))}
              <Plant m={m} position={[0.2, 0.015, 0]} scale={0.7} />
            </>
          )}
        </group>
      ))}

      {/* back desk with monitor, keyboard, mouse, cactus */}
      <group position={[0.85, 0, -1.35]}>
        <mesh material={m.woodBack} position={[0, 0.72, 0]} receiveShadow>
          <boxGeometry args={[1.9, 0.04, 0.6]} />
        </mesh>
        <group position={[-0.05, 1.2, -0.12]}>
          <RoundedBox args={[0.98, 0.58, 0.035]} radius={0.012} smoothness={2} material={m.dark} />
          <mesh material={screenMat} position={[0, 0.01, 0.019]}>
            <planeGeometry args={[0.94, 0.53]} />
          </mesh>
          {/* sticky notes */}
          <mesh material={m.note} position={[0.38, -0.2, 0.021]} rotation={[0, 0, 0.06]}>
            <planeGeometry args={[0.09, 0.09]} />
          </mesh>
          <mesh material={m.noteB} position={[0.28, -0.22, 0.022]} rotation={[0, 0, -0.08]}>
            <planeGeometry args={[0.08, 0.08]} />
          </mesh>
        </group>
        <mesh material={m.charcoal} position={[-0.05, 0.86, -0.14]}>
          <boxGeometry args={[0.05, 0.26, 0.04]} />
        </mesh>
        <mesh material={m.charcoal} position={[-0.05, 0.745, -0.12]}>
          <boxGeometry args={[0.26, 0.012, 0.18]} />
        </mesh>
        <RoundedBox args={[0.44, 0.018, 0.14]} radius={0.006} smoothness={2} material={m.dark} position={[-0.05, 0.75, 0.12]} />
        <RoundedBox args={[0.06, 0.025, 0.1]} radius={0.012} smoothness={2} material={m.dark} position={[0.32, 0.752, 0.12]} />
        <group position={[-0.78, 0.74, -0.05]}>
          <mesh material={m.potDark} position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.055, 0.045, 0.09, 20]} />
          </mesh>
          <mesh material={m.cactus} position={[0, 0.15, 0]} scale={[1, 1.4, 1]}>
            <capsuleGeometry args={[0.035, 0.08, 6, 12]} />
          </mesh>
        </group>
        <Plant m={m} position={[0.78, 0.74, -0.05]} scale={1.15} />
      </group>
    </group>
  )
}

const Ball = ({ r, m, ...p }) => (
  <mesh material={m} {...p}>
    <sphereGeometry args={[r, 20, 20]} />
  </mesh>
)

function Plant({ m, scale = 1, ...p }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 11 }).map((_, i) => ({
        a: (i / 11) * Math.PI * 2 + (i % 2) * 0.3,
        tilt: 0.35 + (i % 3) * 0.22,
        len: 0.12 + (i % 4) * 0.025,
        dark: i % 3 === 0,
      })),
    [],
  )
  return (
    <group scale={scale} {...p}>
      <mesh material={m.pot} position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.05, 0.12, 24]} />
      </mesh>
      <mesh material={m.soil} position={[0, 0.118, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 20]} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.12, 0]} rotation={[0, l.a, 0]}>
          <mesh material={l.dark ? m.leafDark : m.leaf} rotation={[l.tilt, 0, 0]} position={[0, l.len * 0.45, Math.sin(l.tilt) * l.len * 0.5]} scale={[0.38, 1, 0.12]} castShadow>
            <sphereGeometry args={[l.len * 0.55, 14, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── foreground desk ── */
function Desk({ m }) {
  return (
    <group>
      <mesh material={m.wood} position={[0, 0.72, 0.65]} receiveShadow castShadow>
        <boxGeometry args={[3.4, 0.04, 1.8]} />
      </mesh>
    </group>
  )
}

/** Laptop with its lid facing the visitor (screen faces the developer). */
function Laptop({ m, activityRef, reduced }) {
  const glow = useRef()
  const logo = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')
    g.strokeStyle = 'rgba(255,255,255,0.92)'
    g.lineWidth = 9
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(44, 38)
    g.lineTo(20, 64)
    g.lineTo(44, 90)
    g.moveTo(84, 38)
    g.lineTo(108, 64)
    g.lineTo(84, 90)
    g.moveTo(72, 30)
    g.lineTo(56, 98)
    g.stroke()
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.75, toneMapped: false })
  }, [])
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ color: '#9db6ff', toneMapped: false }), [])
  useFrame((state) => {
    if (!glow.current) return
    const a = activityRef.current
    // the screen light flickers very slightly as code scrolls
    glow.current.intensity = 0.3 + (reduced ? 0 : a * 0.08 * (Math.sin(state.clock.elapsedTime * 7) * 0.5 + 0.5))
  })
  return (
    <group position={[0, 0.74, 0.04]}>
      <RoundedBox args={[0.36, 0.016, 0.25]} radius={0.006} smoothness={3} material={m.lid} position={[0, 0.008, 0]} castShadow receiveShadow />
      {/* lid hinged at the visitor-side edge, tilted slightly toward the visitor */}
      <group position={[0, 0.014, 0.122]} rotation={[0.2, 0, 0]}>
        <RoundedBox args={[0.36, 0.245, 0.009]} radius={0.006} smoothness={3} material={m.lid} position={[0, 0.122, 0]} castShadow />
        <mesh material={logo} position={[0, 0.13, 0.0052]}>
          <planeGeometry args={[0.05, 0.05]} />
        </mesh>
        <mesh material={screen} position={[0, 0.125, -0.0052]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.33, 0.21]} />
        </mesh>
      </group>
      {/* cool screen light on the face & hands */}
      <pointLight ref={glow} position={[0, 0.42, 0.0]} color="#a9c2ff" intensity={0.3} distance={0.75} decay={2} />
    </group>
  )
}

function Lamp({ m }) {
  return (
    <group position={[-0.78, 0.74, 0.18]}>
      <mesh material={m.lampShade} position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.024, 28]} />
      </mesh>
      {/* arm: base → elbow → head */}
      <mesh material={m.lampShade} position={[0.02, 0.2, -0.02]} rotation={[0.1, 0, -0.15]}>
        <cylinderGeometry args={[0.011, 0.011, 0.38, 10]} />
      </mesh>
      <mesh material={m.lampShade} position={[0.05, 0.39, -0.04]}>
        <sphereGeometry args={[0.02, 14, 14]} />
      </mesh>
      <mesh material={m.lampShade} position={[0.17, 0.44, 0.0]} rotation={[0, 0, -1.15]}>
        <cylinderGeometry args={[0.01, 0.01, 0.27, 10]} />
      </mesh>
      {/* shade aimed down-right toward the desk */}
      <group position={[0.31, 0.46, 0.04]} rotation={[0.15, 0, -0.75]}>
        <mesh material={m.lampShade} position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.11, 0.13, 28, 1, true]} />
        </mesh>
        <mesh material={m.lampShade} position={[0, 0.015, 0]}>
          <sphereGeometry args={[0.036, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={m.lampGlow} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.1, 28]} />
        </mesh>
        <pointLight position={[0, -0.16, 0]} color="#ffd59a" intensity={1.6} distance={1.6} decay={1.4} />
      </group>
    </group>
  )
}

function Mug({ m, reduced }) {
  const puffs = useRef([])
  const steam = useMemo(() => [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })), [])
  useFrame((state) => {
    if (reduced) return
    const t = state.clock.elapsedTime
    puffs.current.forEach((p, i) => {
      if (!p) return
      const k = (t * 0.3 + i / 3) % 1
      p.position.set(Math.sin(t * 1.2 + i * 2) * 0.014 * (1 + k), 0.13 + k * 0.2, Math.cos(t * 0.9 + i) * 0.01)
      p.scale.setScalar(0.014 + k * 0.035)
      steam[i].opacity = 0.2 * Math.sin(k * Math.PI)
    })
  })
  return (
    <group position={[-0.44, 0.74, 0.66]}>
      <mesh material={m.mug} position={[0, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.042, 0.11, 32]} />
      </mesh>
      <mesh material={m.coffee} position={[0, 0.106, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 28]} />
      </mesh>
      <mesh material={m.mug} position={[0.05, 0.058, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.026, 0.008, 10, 24, Math.PI]} />
      </mesh>
      {!reduced &&
        steam.map((mat, i) => (
          <mesh key={i} ref={(el) => (puffs.current[i] = el)} material={mat} scale={0.001}>
            <sphereGeometry args={[1, 12, 12]} />
          </mesh>
        ))}
    </group>
  )
}

function Books({ m }) {
  return (
    <group position={[0.5, 0.74, 0.62]} rotation={[0, -0.3, 0]}>
      <RoundedBox args={[0.26, 0.035, 0.19]} radius={0.004} smoothness={2} material={m.book3} position={[0, 0.018, 0]} castShadow />
      <RoundedBox args={[0.24, 0.032, 0.18]} radius={0.004} smoothness={2} material={m.book1} position={[0.01, 0.052, 0.005]} rotation={[0, 0.08, 0]} castShadow />
      <RoundedBox args={[0.25, 0.03, 0.18]} radius={0.004} smoothness={2} material={m.book2} position={[-0.005, 0.083, 0]} rotation={[0, -0.05, 0]} castShadow />
      <mesh material={m.paper} position={[0.02, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.2, 0.26]} />
      </mesh>
    </group>
  )
}

function ChairBack({ m }) {
  return (
    <group position={[0, 0, CHAR_Z - 0.22]}>
      <RoundedBox args={[0.56, 0.5, 0.07]} radius={0.06} smoothness={4} material={m.chair} position={[0, 0.98, 0]} rotation={[-0.1, 0, 0]} />
    </group>
  )
}

/* ── scene ── */
function SceneContents({ anim, pointerRef, reduced, compact, onReady }) {
  const m = useMats()
  const monitor = useMemo(() => createCodeScreen({ width: 1024, height: 576 }), [])
  const activityRef = useRef(0)
  const readyOnce = useRef(false)
  const { scene } = useThree()

  useEffect(() => {
    scene.fog = new THREE.Fog(FOG, 3.7, 8)
    scene.background = new THREE.Color(FOG)
    monitor.prefill(0.6)
    return () => {
      scene.fog = null
      monitor.dispose()
    }
  }, [scene, monitor])

  useFrame((_, dt) => {
    monitor.update(Math.min(dt, 0.1), reduced ? 0 : 24 * activityRef.current)
    if (!readyOnce.current) {
      readyOnce.current = true
      onReady?.()
    }
  })

  return (
    <>
      <StudioEnvironment />
      <CameraRig pointerRef={pointerRef} compact={compact} />

      <hemisphereLight args={['#fff6ec', '#b9a894', 0.5]} />
      {/* window light from behind-left: rim on hair and shoulders */}
      <directionalLight position={[-1.6, 2.8, -3]} intensity={1.7} color="#eef4ff" />
      {/* soft front key, casts the desk shadows */}
      <directionalLight
        position={[-1.1, 2.6, 2.6]}
        intensity={1.55}
        color="#fff3e6"
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1.2}
        shadow-camera-right={1.2}
        shadow-camera-top={1.4}
        shadow-camera-bottom={-0.6}
        shadow-camera-near={0.5}
        shadow-camera-far={7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={5}
      />
      <directionalLight position={[2, 1.4, 2]} intensity={0.45} color="#ffe9d6" />

      <Room m={m} monitor={monitor} />
      <ChairBack m={m} />
      <group position={[0, 0, CHAR_Z]}>
        <DeveloperCharacter anim={anim} reduced={reduced} onActivity={(v) => (activityRef.current = v)} />
      </group>
      <Desk m={m} />
      <Laptop m={m} activityRef={activityRef} reduced={reduced} />
      <Lamp m={m} />
      <Mug m={m} reduced={reduced} />
      <Books m={m} />
    </>
  )
}

export default function DeveloperScene({ anim, pointerRef, reduced, compact, active = true, onReady }) {
  return (
    <Canvas
      className="!absolute inset-0"
      shadows={compact ? false : 'soft'}
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.5, 2.85], fov: 24, near: 0.05, far: 30 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.95
      }}
      aria-hidden="true"
    >
      <SceneContents anim={anim} pointerRef={pointerRef} reduced={reduced} compact={compact} onReady={onReady} />
    </Canvas>
  )
}
