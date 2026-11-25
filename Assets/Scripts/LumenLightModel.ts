/**
 * LumenLightModel — pure photometry, no scene access.
 * Point sources, inverse-square law with cosine of incidence on a horizontal desk.
 * All inputs in centimetres (Lens units); converted to metres internally so the
 * result is in lux (lm/m^2).
 * Owns: illuminance maths and head-sphere occlusion test. Must not touch SceneObjects.
 */

export interface PointLight {
  /** world position, cm */
  pos: vec3
  /** luminous flux, lm */
  lumens: number
  /** full cone angle in degrees, pointing straight down; >= 360 means isotropic */
  coneDeg: number
  on: boolean
}

export interface Occluder {
  center: vec3
  radius: number
}

/** Luminous intensity (cd) of a source spreading its flux uniformly over its cone. */
export function intensityCd(light: PointLight): number {
  if (light.coneDeg >= 360) return light.lumens / (4 * Math.PI)
  const half = (light.coneDeg * 0.5 * Math.PI) / 180
  const solidAngle = 2 * Math.PI * (1 - Math.cos(half))
  return light.lumens / solidAngle
}

/** True if the segment from a to b passes through the sphere. */
export function segmentHitsSphere(a: vec3, b: vec3, s: Occluder): boolean {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z
  const acx = s.center.x - a.x, acy = s.center.y - a.y, acz = s.center.z - a.z
  const len2 = abx * abx + aby * aby + abz * abz
  let t = len2 > 0 ? (acx * abx + acy * aby + acz * abz) / len2 : 0
  t = Math.max(0, Math.min(1, t))
  const dx = a.x + abx * t - s.center.x
  const dy = a.y + aby * t - s.center.y
  const dz = a.z + abz * t - s.center.z
  return dx * dx + dy * dy + dz * dz < s.radius * s.radius
}

export interface PointResult {
  lux: number
  /** lux this point would receive from the lamp(s) if the head were not in the way */
  blockedLux: number
}

/**
 * Illuminance on a horizontal (normal +Y) surface point (x, y, z in cm).
 * Lights with coneDeg < 360 emit only into their downward cone.
 */
export function illuminanceAt(
  x: number,
  y: number,
  z: number,
  lights: PointLight[],
  intensities: number[],
  occluder: Occluder | null
): PointResult {
  let lux = 0
  let blocked = 0
  for (let i = 0; i < lights.length; i++) {
    const L = lights[i]
    if (!L.on) continue
    const dx = (L.pos.x - x) / 100
    const dy = (L.pos.y - y) / 100
    const dz = (L.pos.z - z) / 100
    if (dy <= 0) continue
    const d2 = dx * dx + dy * dy + dz * dz
    const d = Math.sqrt(d2)
    const cosIncidence = dy / d // surface normal is +Y
    if (L.coneDeg < 360) {
      // angle off the lamp's downward axis equals the incidence angle on a horizontal desk
      const halfCos = Math.cos((L.coneDeg * 0.5 * Math.PI) / 180)
      if (cosIncidence < halfCos) continue
    }
    const e = (intensities[i] * cosIncidence) / d2
    if (occluder && segmentHitsSphere(new vec3(x, y, z), L.pos, occluder)) {
      blocked += e
    } else {
      lux += e
    }
  }
  return {lux: lux, blockedLux: blocked}
}
