import type { FaceConfig, FaceLandmarks, FaceParameters, FacialHair, Point } from './face-types'
import { hashSeed, pickFor, randomFor } from './seeded-random'

type Range = readonly [number, number]

export const FACE_RANGES = {
  faceHeight: [66, 78],
  foreheadSlope: [-3.5, 4],
  headTilt: [-3.2, 3.2],
  jawRatio: [0.58, 0.82],
  lineWidth: [0.68, 0.96],
  skullWidth: [43, 58],
} as const satisfies Record<string, Range>

const facialHairOptions: readonly FacialHair[] = ['none', 'none', 'none', 'stubble', 'mustache', 'chin']

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function valueFor(seed: string, property: string, [minimum, maximum]: Range) {
  return round(minimum + randomFor(seed, property) * (maximum - minimum))
}

function signedFor(seed: string, property: string) {
  return randomFor(seed, property) * 2 - 1
}

function point(x: number, y: number): Point {
  return { x: round(x), y: round(y) }
}

export function normalizeFaceSeed(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en-US')
}

export function generateFace(seed: string): FaceConfig {
  const safeSeed = seed || 'anonymous visitor'
  const mood = signedFor(safeSeed, 'mood')
  const age = randomFor(safeSeed, 'age')
  const angularity = signedFor(safeSeed, 'angularity')
  const asymmetry = signedFor(safeSeed, 'asymmetry')
  const skullWidth = valueFor(safeSeed, 'skull-width', FACE_RANGES.skullWidth)
  const faceHeight = valueFor(safeSeed, 'face-height', FACE_RANGES.faceHeight)
  const foreheadSlope = valueFor(safeSeed, 'forehead-slope', FACE_RANGES.foreheadSlope)
  const jawRatio = clamp(0.7 + angularity * 0.09 + signedFor(safeSeed, 'jaw-jitter') * 0.04, ...FACE_RANGES.jawRatio)
  const jawWidth = round(skullWidth * jawRatio)
  const chinWidth = round(jawWidth * clamp(0.48 - angularity * 0.1, 0.34, 0.62))
  const jawImbalance = asymmetry * 1.35
  const chinOffset = asymmetry * 0.8 + signedFor(safeSeed, 'chin-offset') * 0.35
  const centerX = 50
  const topY = 9.5
  const chinY = topY + faceHeight
  const templeY = topY + faceHeight * 0.24
  const cheekY = topY + faceHeight * 0.51
  const jawY = topY + faceHeight * 0.75
  const chinSideY = topY + faceHeight * 0.9
  const skullHalf = skullWidth / 2
  const cheekHalf = skullWidth * (0.45 + signedFor(safeSeed, 'cheek-width') * 0.025)
  const jawHalf = jawWidth / 2
  const chinHalf = chinWidth / 2

  const eyeY = topY + faceHeight * (0.365 + signedFor(safeSeed, 'eye-height') * 0.018)
  const eyeSpacing = skullWidth * (0.35 + signedFor(safeSeed, 'eye-spacing') * 0.045)
  const eyeWidth = skullWidth * (0.165 + signedFor(safeSeed, 'eye-width') * 0.018)
  const eyeAsymmetry = asymmetry * 1.05
  const leftEyeCenterX = centerX - eyeSpacing / 2
  const rightEyeCenterX = centerX + eyeSpacing / 2
  const leftEyeY = eyeY - eyeAsymmetry / 2
  const rightEyeY = eyeY + eyeAsymmetry / 2
  const baseEyeOpenness = clamp(2.4 + mood * 0.35 - age * 0.45, 1.35, 3.15)
  const leftEyeOpenness = clamp(
    baseEyeOpenness + asymmetry * 0.38 + signedFor(safeSeed, 'left-eye-open') * 0.28,
    1.05,
    3.5,
  )
  const rightEyeOpenness = clamp(
    baseEyeOpenness - asymmetry * 0.38 + signedFor(safeSeed, 'right-eye-open') * 0.28,
    1.05,
    3.5,
  )

  const leftBrowAngle = clamp(-mood * 1.7 + asymmetry * 1.25 + signedFor(safeSeed, 'left-brow') * 1.2, -4, 4)
  const rightBrowAngle = clamp(-mood * 1.7 - asymmetry * 1.25 + signedFor(safeSeed, 'right-brow') * 1.2, -4, 4)
  const browY = eyeY - 7.5

  const noseLength = faceHeight * (0.29 + signedFor(safeSeed, 'nose-length') * 0.035)
  const noseBend = asymmetry * 1.45 + signedFor(safeSeed, 'nose-bend') * 0.75
  const noseWidth = clamp(7.2 + angularity * 1.1 + signedFor(safeSeed, 'nose-width') * 1.1, 5.2, 9.8)
  const noseTipY = eyeY + noseLength

  const mouthY = topY + faceHeight * 0.77
  const mouthWidth = jawWidth * (0.58 + signedFor(safeSeed, 'mouth-width') * 0.08)
  const mouthOffset = asymmetry * 1.05 + signedFor(safeSeed, 'mouth-offset') * 0.45
  const mouthCurvature = clamp(mood * 3 + signedFor(safeSeed, 'mouth-curve') * 1.15, -3.8, 4.1)
  const mouthCenterX = centerX + mouthOffset

  const earScale = 0.88 + randomFor(safeSeed, 'ear-scale') * 0.34
  const earTopY = eyeY - 5 * earScale
  const earBottomY = noseTipY + 6 * earScale
  const leftTempleX = centerX - skullHalf + foreheadSlope
  const rightTempleX = centerX + skullHalf + foreheadSlope * 0.22
  const leftCheekX = centerX - cheekHalf - jawImbalance * 0.2
  const rightCheekX = centerX + cheekHalf - jawImbalance * 0.14
  const earReach = 4.2 * earScale

  const neckWidth = jawWidth * clamp(0.54 + angularity * 0.07, 0.42, 0.68)
  const baldness = clamp(age * 0.66 + randomFor(safeSeed, 'baldness') * 0.48 - 0.12, 0, 1)
  const hairDensity = clamp(1 - baldness + signedFor(safeSeed, 'hair-density') * 0.18, 0.08, 1)
  const hairlineY = topY + 7 + baldness * 13
  const hairlineInset = 4.8 + baldness * 4
  const hairlineLeftX = leftTempleX + hairlineInset
  const hairlineRightX = rightTempleX - hairlineInset
  const hairlineCenterX = centerX + asymmetry * 0.55

  const landmarks: FaceLandmarks = {
    chinLeft: point(centerX - chinHalf + jawImbalance * 0.15, chinSideY),
    chinRight: point(centerX + chinHalf + jawImbalance * 0.08, chinSideY + asymmetry * 0.28),
    chinTip: point(centerX + chinOffset, chinY),
    hairline: [
      point(hairlineLeftX, hairlineY + 2.5),
      point(centerX - skullWidth * 0.16, hairlineY - 1 + asymmetry * 0.4),
      point(hairlineCenterX, hairlineY + 2.2 + baldness * 1.8),
      point(centerX + skullWidth * 0.16, hairlineY - 1.4 - asymmetry * 0.25),
      point(hairlineRightX, hairlineY + 2),
    ],
    leftBrow: {
      inner: point(leftEyeCenterX + eyeWidth * 0.48, browY + leftBrowAngle / 2),
      outer: point(leftEyeCenterX - eyeWidth * 0.62, browY - leftBrowAngle / 2),
    },
    leftCheek: point(leftCheekX, cheekY),
    leftEar: {
      bottom: point(leftCheekX + 0.35, earBottomY),
      inner: point(leftTempleX - earReach * 0.38, (earTopY + earBottomY) / 2 + 1.2),
      outer: point(leftTempleX - earReach, (earTopY + earBottomY) / 2),
      top: point(leftTempleX + 0.2, earTopY),
    },
    leftEye: {
      inner: point(leftEyeCenterX + eyeWidth / 2, leftEyeY),
      outer: point(leftEyeCenterX - eyeWidth / 2, leftEyeY + asymmetry * 0.12),
    },
    leftJaw: point(centerX - jawHalf - jawImbalance, jawY),
    leftTemple: point(leftTempleX, templeY),
    mouthCenter: point(mouthCenterX, mouthY + mouthCurvature),
    mouthLeft: point(mouthCenterX - mouthWidth / 2, mouthY - asymmetry * 0.28),
    mouthLower: point(mouthCenterX + asymmetry * 0.3, mouthY + Math.abs(mouthCurvature) * 0.35 + 3.2),
    mouthRight: point(mouthCenterX + mouthWidth / 2, mouthY + asymmetry * 0.32),
    neckLeft: point(centerX - neckWidth / 2 + chinOffset * 0.25, 97),
    neckRight: point(centerX + neckWidth / 2 + chinOffset * 0.25, 97),
    noseBend: point(centerX + noseBend * 0.58, eyeY + noseLength * 0.55),
    noseBridge: point(centerX + noseBend * 0.1, eyeY + 1.2),
    noseLeft: point(centerX + noseBend - noseWidth / 2, noseTipY + 1.2),
    noseRight: point(centerX + noseBend + noseWidth / 2, noseTipY + 0.8),
    noseTip: point(centerX + noseBend, noseTipY),
    rightBrow: {
      inner: point(rightEyeCenterX - eyeWidth * 0.48, browY + rightBrowAngle / 2 + eyeAsymmetry),
      outer: point(rightEyeCenterX + eyeWidth * 0.62, browY - rightBrowAngle / 2 + eyeAsymmetry),
    },
    rightCheek: point(rightCheekX, cheekY + asymmetry * 0.25),
    rightEar: {
      bottom: point(rightCheekX - 0.35, earBottomY + asymmetry * 0.25),
      inner: point(rightTempleX + earReach * 0.38, (earTopY + earBottomY) / 2 - 0.8),
      outer: point(rightTempleX + earReach, (earTopY + earBottomY) / 2 + asymmetry * 0.25),
      top: point(rightTempleX - 0.2, earTopY + asymmetry * 0.2),
    },
    rightEye: {
      inner: point(rightEyeCenterX - eyeWidth / 2, rightEyeY),
      outer: point(rightEyeCenterX + eyeWidth / 2, rightEyeY - asymmetry * 0.12),
    },
    rightJaw: point(centerX + jawHalf - jawImbalance * 0.12, jawY + asymmetry * 0.34),
    rightTemple: point(rightTempleX, templeY + asymmetry * 0.2),
    skullTop: point(centerX + asymmetry * 0.25, topY),
  }

  const parameters: FaceParameters = {
    age: round(age),
    asymmetry: round(asymmetry),
    baldness: round(baldness),
    eyeBagDepth: round(clamp(age * 1.8 + randomFor(safeSeed, 'eye-bags') * 0.75 - 0.35, 0, 2.35)),
    eyeWidth: round(eyeWidth),
    faceHeight: round(faceHeight),
    facialHair: pickFor(safeSeed, 'facial-hair', facialHairOptions),
    glasses: randomFor(safeSeed, 'glasses') > 0.72,
    hairDensity: round(hairDensity),
    headTilt: valueFor(safeSeed, 'head-tilt', FACE_RANGES.headTilt),
    jawWidth,
    leftEyeOpenness: round(leftEyeOpenness),
    lineWidth: valueFor(safeSeed, 'line-width', FACE_RANGES.lineWidth),
    mood: round(mood),
    mouthCurvature: round(mouthCurvature),
    noseWidth: round(noseWidth),
    rightEyeOpenness: round(rightEyeOpenness),
    skullWidth: round(skullWidth),
    wrinkleDepth: round(clamp(age * 0.82 + randomFor(safeSeed, 'wrinkles') * 0.34 - 0.18, 0, 1)),
  }

  return {
    checksum: hashSeed(safeSeed).toString(16).padStart(8, '0'),
    landmarks,
    parameters,
    seed: safeSeed,
  }
}
