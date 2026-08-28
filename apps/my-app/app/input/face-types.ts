export type Point = {
  x: number
  y: number
}

export type EyeLandmarks = {
  inner: Point
  outer: Point
}

export type BrowLandmarks = {
  inner: Point
  outer: Point
}

export type EarLandmarks = {
  bottom: Point
  inner: Point
  outer: Point
  top: Point
}

export type FaceLandmarks = {
  chinLeft: Point
  chinRight: Point
  chinTip: Point
  hairline: [Point, Point, Point, Point, Point]
  leftBrow: BrowLandmarks
  leftCheek: Point
  leftEar: EarLandmarks
  leftEye: EyeLandmarks
  leftJaw: Point
  leftTemple: Point
  mouthCenter: Point
  mouthLeft: Point
  mouthLower: Point
  mouthRight: Point
  neckLeft: Point
  neckRight: Point
  noseBend: Point
  noseBridge: Point
  noseLeft: Point
  noseRight: Point
  noseTip: Point
  rightBrow: BrowLandmarks
  rightCheek: Point
  rightEar: EarLandmarks
  rightEye: EyeLandmarks
  rightJaw: Point
  rightTemple: Point
  skullTop: Point
}

export type FacialHair = 'chin' | 'mustache' | 'none' | 'stubble'

export type FaceParameters = {
  age: number
  asymmetry: number
  baldness: number
  eyeBagDepth: number
  eyeWidth: number
  faceHeight: number
  facialHair: FacialHair
  glasses: boolean
  hairDensity: number
  headTilt: number
  jawWidth: number
  leftEyeOpenness: number
  lineWidth: number
  mood: number
  mouthCurvature: number
  noseWidth: number
  rightEyeOpenness: number
  skullWidth: number
  wrinkleDepth: number
}

export type FaceConfig = {
  checksum: string
  landmarks: FaceLandmarks
  parameters: FaceParameters
  seed: string
}
