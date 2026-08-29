import type { FaceConfig, FaceLandmarks, Point } from './face-types'
import { generateFace } from './generate-face'
import { randomFor } from './seeded-random'

function round(value: number) {
  return Math.round(value * 100) / 100
}

function between(seed: string, property: string, minimum: number, maximum: number) {
  return minimum + randomFor(seed, `single-line-${property}`) * (maximum - minimum)
}

function point(x: number, y: number): Point {
  return { x: round(x), y: round(y) }
}

function midpoint(start: Point, end: Point) {
  return point((start.x + end.x) / 2, (start.y + end.y) / 2)
}

function cloneLandmarks(source: FaceLandmarks): FaceLandmarks {
  return {
    chinLeft: { ...source.chinLeft },
    chinRight: { ...source.chinRight },
    chinTip: { ...source.chinTip },
    hairline: source.hairline.map((entry) => ({ ...entry })) as FaceLandmarks['hairline'],
    leftBrow: { inner: { ...source.leftBrow.inner }, outer: { ...source.leftBrow.outer } },
    leftCheek: { ...source.leftCheek },
    leftEar: {
      bottom: { ...source.leftEar.bottom },
      inner: { ...source.leftEar.inner },
      outer: { ...source.leftEar.outer },
      top: { ...source.leftEar.top },
    },
    leftEye: { inner: { ...source.leftEye.inner }, outer: { ...source.leftEye.outer } },
    leftJaw: { ...source.leftJaw },
    leftTemple: { ...source.leftTemple },
    mouthCenter: { ...source.mouthCenter },
    mouthLeft: { ...source.mouthLeft },
    mouthLower: { ...source.mouthLower },
    mouthRight: { ...source.mouthRight },
    neckLeft: { ...source.neckLeft },
    neckRight: { ...source.neckRight },
    noseBend: { ...source.noseBend },
    noseBridge: { ...source.noseBridge },
    noseLeft: { ...source.noseLeft },
    noseRight: { ...source.noseRight },
    noseTip: { ...source.noseTip },
    rightBrow: { inner: { ...source.rightBrow.inner }, outer: { ...source.rightBrow.outer } },
    rightCheek: { ...source.rightCheek },
    rightEar: {
      bottom: { ...source.rightEar.bottom },
      inner: { ...source.rightEar.inner },
      outer: { ...source.rightEar.outer },
      top: { ...source.rightEar.top },
    },
    rightEye: { inner: { ...source.rightEye.inner }, outer: { ...source.rightEye.outer } },
    rightJaw: { ...source.rightJaw },
    rightTemple: { ...source.rightTemple },
    skullTop: { ...source.skullTop },
  }
}

function scaleX(source: Point, factor: number, center = 50) {
  return point(center + (source.x - center) * factor, source.y)
}

function scaleY(source: Point, factor: number, top = 9.5) {
  return point(source.x, top + (source.y - top) * factor)
}

export function generateSingleLineFace(seed: string): FaceConfig {
  const base = generateFace(seed)
  const face = cloneLandmarks(base.landmarks)
  const heightFactor = between(seed, 'height', 0.84, 1.08)
  const craniumFactor = between(seed, 'cranium', 0.72, 1.28)
  const cheekFactor = between(seed, 'cheeks', 0.76, 1.24)
  const jawFactor = between(seed, 'jaw', 0.64, 1.34)
  const chinFactor = between(seed, 'chin-width', 0.58, 1.34)
  const chinDepth = between(seed, 'chin-depth', -4.5, 5.2)
  const eyeSpacingFactor = between(seed, 'eye-spacing', 0.68, 1.38)
  const eyeWidthFactor = between(seed, 'eye-width', 0.68, 1.42)
  const eyeYShift = between(seed, 'eye-height', -4.2, 4.2)
  const eyeSkew = between(seed, 'eye-skew', -1.6, 1.6)
  const browLift = between(seed, 'brow-lift', -3, 3.2)
  const noseLengthFactor = between(seed, 'nose-length', 0.68, 1.42)
  const noseWidthFactor = between(seed, 'nose-width', 0.58, 1.48)
  const mouthWidthFactor = between(seed, 'mouth-width', 0.58, 1.46)
  const mouthYShift = between(seed, 'mouth-height', -3.6, 3.6)
  const earScale = between(seed, 'ears', 0.62, 1.5)
  const neckFactor = between(seed, 'neck', 0.58, 1.46)

  face.skullTop = scaleY(face.skullTop, heightFactor)
  face.leftTemple = scaleY(face.leftTemple, heightFactor)
  face.rightTemple = scaleY(face.rightTemple, heightFactor)
  face.leftCheek = scaleY(face.leftCheek, heightFactor)
  face.rightCheek = scaleY(face.rightCheek, heightFactor)
  face.leftJaw = scaleY(face.leftJaw, heightFactor)
  face.rightJaw = scaleY(face.rightJaw, heightFactor)
  face.chinLeft = scaleY(face.chinLeft, heightFactor)
  face.chinRight = scaleY(face.chinRight, heightFactor)
  face.chinTip = scaleY(face.chinTip, heightFactor)
  face.neckLeft = scaleY(face.neckLeft, heightFactor)
  face.neckRight = scaleY(face.neckRight, heightFactor)

  face.skullTop = scaleX(face.skullTop, craniumFactor)
  face.leftTemple = scaleX(face.leftTemple, craniumFactor)
  face.rightTemple = scaleX(face.rightTemple, craniumFactor)
  face.leftCheek = scaleX(face.leftCheek, cheekFactor)
  face.rightCheek = scaleX(face.rightCheek, cheekFactor)
  face.leftJaw = scaleX(face.leftJaw, jawFactor)
  face.rightJaw = scaleX(face.rightJaw, jawFactor)
  face.chinLeft = scaleX(face.chinLeft, chinFactor)
  face.chinRight = scaleX(face.chinRight, chinFactor)
  face.chinTip = point(face.chinTip.x, face.chinTip.y + chinDepth)
  face.chinLeft = point(face.chinLeft.x, face.chinLeft.y + chinDepth * 0.45)
  face.chinRight = point(face.chinRight.x, face.chinRight.y + chinDepth * 0.45)

  const reshapeEye = (side: 'left' | 'right') => {
    const source = side === 'left' ? base.landmarks.leftEye : base.landmarks.rightEye
    const center = midpoint(source.outer, source.inner)
    const centerX = 50 + (center.x - 50) * eyeSpacingFactor
    const halfWidth = (Math.abs(source.outer.x - source.inner.x) / 2) * eyeWidthFactor
    const y = 9.5 + (center.y - 9.5) * heightFactor + eyeYShift + (side === 'left' ? -eyeSkew / 2 : eyeSkew / 2)

    return side === 'left'
      ? { outer: point(centerX - halfWidth, y), inner: point(centerX + halfWidth, y) }
      : { inner: point(centerX - halfWidth, y), outer: point(centerX + halfWidth, y) }
  }

  face.leftEye = reshapeEye('left')
  face.rightEye = reshapeEye('right')

  const reshapeBrow = (side: 'left' | 'right') => {
    const source = side === 'left' ? base.landmarks.leftBrow : base.landmarks.rightBrow
    const center = midpoint(source.outer, source.inner)
    const centerX = 50 + (center.x - 50) * eyeSpacingFactor
    const halfWidth = (Math.abs(source.outer.x - source.inner.x) / 2) * eyeWidthFactor
    const outerY = 9.5 + (source.outer.y - 9.5) * heightFactor + eyeYShift + browLift
    const innerY = 9.5 + (source.inner.y - 9.5) * heightFactor + eyeYShift + browLift

    return side === 'left'
      ? { outer: point(centerX - halfWidth, outerY), inner: point(centerX + halfWidth, innerY) }
      : { inner: point(centerX - halfWidth, innerY), outer: point(centerX + halfWidth, outerY) }
  }

  face.leftBrow = reshapeBrow('left')
  face.rightBrow = reshapeBrow('right')

  const originalNose = base.landmarks
  const noseBridge = point(originalNose.noseBridge.x, 9.5 + (originalNose.noseBridge.y - 9.5) * heightFactor + eyeYShift)
  const noseVectorY = (originalNose.noseTip.y - originalNose.noseBridge.y) * heightFactor
  const noseCenterX = originalNose.noseTip.x
  face.noseBridge = noseBridge
  face.noseBend = point(
    noseBridge.x + (originalNose.noseBend.x - originalNose.noseBridge.x) * 1.35,
    noseBridge.y + (originalNose.noseBend.y - originalNose.noseBridge.y) * heightFactor * noseLengthFactor,
  )
  face.noseTip = point(noseCenterX, noseBridge.y + noseVectorY * noseLengthFactor)
  face.noseLeft = point(noseCenterX + (originalNose.noseLeft.x - noseCenterX) * noseWidthFactor, face.noseTip.y + 1.2)
  face.noseRight = point(noseCenterX + (originalNose.noseRight.x - noseCenterX) * noseWidthFactor, face.noseTip.y + 0.8)

  const mouthCenterX = base.landmarks.mouthCenter.x
  const mouthBaseY = 9.5 + (base.landmarks.mouthCenter.y - 9.5) * heightFactor + mouthYShift
  face.mouthCenter = point(mouthCenterX, mouthBaseY)
  face.mouthLeft = point(mouthCenterX + (base.landmarks.mouthLeft.x - mouthCenterX) * mouthWidthFactor, 9.5 + (base.landmarks.mouthLeft.y - 9.5) * heightFactor + mouthYShift)
  face.mouthRight = point(mouthCenterX + (base.landmarks.mouthRight.x - mouthCenterX) * mouthWidthFactor, 9.5 + (base.landmarks.mouthRight.y - 9.5) * heightFactor + mouthYShift)
  face.mouthLower = point(base.landmarks.mouthLower.x, 9.5 + (base.landmarks.mouthLower.y - 9.5) * heightFactor + mouthYShift + Math.max(chinDepth, 0) * 0.22)

  const reshapeEar = (side: 'left' | 'right') => {
    const source = side === 'left' ? base.landmarks.leftEar : base.landmarks.rightEar
    const temple = side === 'left' ? face.leftTemple : face.rightTemple
    const centerY = 9.5 + (((source.top.y + source.bottom.y) / 2) - 9.5) * heightFactor
    const halfHeight = ((source.bottom.y - source.top.y) / 2) * heightFactor * earScale
    const direction = side === 'left' ? -1 : 1
    return {
      top: point(temple.x, centerY - halfHeight),
      outer: point(temple.x + direction * 5 * earScale, centerY),
      bottom: point(temple.x, centerY + halfHeight),
      inner: point(temple.x + direction * 2 * earScale, centerY + 1),
    }
  }

  face.leftEar = reshapeEar('left')
  face.rightEar = reshapeEar('right')
  face.neckLeft = scaleX(face.neckLeft, neckFactor)
  face.neckRight = scaleX(face.neckRight, neckFactor)
  face.neckLeft = point(face.neckLeft.x, 97)
  face.neckRight = point(face.neckRight.x, 97)

  return {
    ...base,
    landmarks: face,
    parameters: {
      ...base.parameters,
      faceHeight: round(base.parameters.faceHeight * heightFactor),
      headTilt: round(between(seed, 'tilt', -5.4, 5.4)),
      jawWidth: round(base.parameters.jawWidth * jawFactor),
      leftEyeOpenness: round(base.parameters.leftEyeOpenness * between(seed, 'left-eye-open', 0.68, 1.34)),
      lineWidth: round(between(seed, 'line-weight', 0.7, 1.12)),
      noseWidth: round(base.parameters.noseWidth * noseWidthFactor),
      rightEyeOpenness: round(base.parameters.rightEyeOpenness * between(seed, 'right-eye-open', 0.68, 1.34)),
      skullWidth: round(base.parameters.skullWidth * craniumFactor),
    },
  }
}
