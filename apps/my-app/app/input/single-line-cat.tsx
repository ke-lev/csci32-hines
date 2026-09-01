import type { CSSProperties, Ref } from 'react'
import type { FaceConfig, Point } from './face-types'
import styles from './live-drawing.module.css'

type SingleLineCatProps = {
  config: FaceConfig
  name: string
  svgRef?: Ref<SVGSVGElement>
}

function p(point: Point) {
  return `${point.x} ${point.y}`
}

function midpoint(start: Point, end: Point) {
  return {
    x: Math.round(((start.x + end.x) / 2) * 100) / 100,
    y: Math.round(((start.y + end.y) / 2) * 100) / 100,
  }
}

export function SingleLineCat({ config, name, svgRef }: SingleLineCatProps) {
  const { landmarks: face, parameters } = config
  const titleId = `single-line-cat-title-${config.checksum}`
  const descriptionId = `single-line-cat-description-${config.checksum}`
  const leftEyeCenter = midpoint(face.leftEye.outer, face.leftEye.inner)
  const rightEyeCenter = midpoint(face.rightEye.inner, face.rightEye.outer)
  const leftEarBase = {
    x: face.leftTemple.x - 0.8,
    y: face.leftTemple.y + 2.2 + parameters.asymmetry * 0.7,
  }
  const leftEarTip = {
    x: face.leftTemple.x + parameters.skullWidth * 0.1 + parameters.asymmetry * 1.5,
    y: face.skullTop.y - 2.5 - parameters.leftEyeOpenness * 0.35,
  }
  const leftEarInner = {
    x: face.skullTop.x - parameters.skullWidth * 0.14 + parameters.asymmetry * 0.7,
    y: face.skullTop.y + 8.3 + parameters.asymmetry * 0.9,
  }
  const rightEarInner = {
    x: face.skullTop.x + parameters.skullWidth * 0.12 + parameters.asymmetry * 0.4,
    y: face.skullTop.y + 9.5 - parameters.asymmetry,
  }
  const rightEarTip = {
    x: face.rightTemple.x - parameters.skullWidth * 0.085 + parameters.asymmetry * 1.1,
    y: face.skullTop.y - 4.2 + parameters.rightEyeOpenness * 0.45,
  }
  const rightEarBase = {
    x: face.rightTemple.x + 1.2,
    y: face.rightTemple.y + 3.8 - parameters.asymmetry * 0.8,
  }
  const noseLeft = { x: face.noseTip.x - parameters.noseWidth * 0.44, y: face.noseTip.y + 0.5 }
  const noseRight = { x: face.noseTip.x + parameters.noseWidth * 0.44, y: face.noseTip.y + 0.5 }
  const noseBottom = { x: face.noseTip.x, y: face.noseTip.y + 3.2 }
  const mouthCenter = { x: face.noseTip.x, y: face.noseTip.y + 4.2 }
  const mouthWidth = Math.max(
    8.5,
    parameters.skullWidth * (0.16 + Math.abs(parameters.asymmetry) * 0.025 + parameters.age * 0.01),
  )
  const mouthDepth = 3.8 + (parameters.mood + 1) * 1.05 + parameters.age * 0.7
  const leftMouthWidth = mouthWidth * (1 + parameters.asymmetry * 0.12)
  const rightMouthWidth = mouthWidth * (1 - parameters.asymmetry * 0.12)
  const mouthLeft = {
    x: mouthCenter.x - leftMouthWidth,
    y: mouthCenter.y + parameters.asymmetry * 0.8,
  }
  const mouthRight = {
    x: mouthCenter.x + rightMouthWidth,
    y: mouthCenter.y - parameters.asymmetry * 0.6,
  }

  // One path keeps the portrait's blind-contour route, replacing the human crown and mouth with feline geometry.
  const line = [
    `M ${p(face.neckLeft)}`,
    `C ${face.neckLeft.x - 1} ${face.neckLeft.y - 8}, ${face.leftJaw.x + 1} ${face.leftJaw.y + 5}, ${p(face.leftJaw)}`,
    `C ${face.leftJaw.x - 1} ${face.leftJaw.y - 5}, ${face.leftCheek.x - 1} ${face.leftCheek.y + 7}, ${p(face.leftCheek)}`,
    `C ${face.leftCheek.x - 1} ${face.leftCheek.y - 6}, ${leftEarBase.x} ${leftEarBase.y + 6}, ${p(leftEarBase)}`,
    `Q ${leftEarBase.x - 1.5} ${leftEarBase.y - 8.5}, ${p(leftEarTip)}`,
    `Q ${leftEarTip.x + 2.5} ${leftEarTip.y + 3}, ${p(leftEarInner)}`,
    `C ${face.skullTop.x - 5} ${face.skullTop.y + 6}, ${face.skullTop.x + 5} ${face.skullTop.y + 6}, ${p(rightEarInner)}`,
    `Q ${rightEarTip.x - 2.2} ${rightEarTip.y + 3.5}, ${p(rightEarTip)}`,
    `Q ${rightEarBase.x + 2} ${rightEarBase.y - 9}, ${p(rightEarBase)}`,
    `C ${rightEarBase.x} ${rightEarBase.y + 6}, ${face.rightCheek.x + 1} ${face.rightCheek.y - 6}, ${p(face.rightCheek)}`,
    `C ${face.rightCheek.x + 1} ${face.rightCheek.y + 7}, ${face.rightJaw.x + 1} ${face.rightJaw.y - 5}, ${p(face.rightJaw)}`,
    `C ${face.rightJaw.x - 1} ${face.rightJaw.y + 5}, ${face.neckRight.x + 1} ${face.neckRight.y - 8}, ${p(face.neckRight)}`,
    `C ${face.neckRight.x - 1} ${face.neckRight.y - 9}, ${face.rightJaw.x - 3} ${face.rightJaw.y + 3}, ${p(face.rightJaw)}`,
    `C ${face.rightJaw.x + 4} ${face.rightJaw.y - 9}, ${face.rightCheek.x + 2} ${face.rightCheek.y + 4}, ${p(face.rightCheek)}`,
    `L ${p(rightEarBase)}`,
    `Q ${rightEarBase.x + 1} ${rightEarBase.y - 8}, ${p(rightEarTip)}`,
    `Q ${rightEarTip.x - 1.5} ${rightEarTip.y + 4}, ${p(rightEarInner)}`,
    `L ${p(face.rightEye.outer)}`,
    `Q ${rightEyeCenter.x} ${rightEyeCenter.y - parameters.rightEyeOpenness * 0.72}, ${p(face.rightEye.inner)}`,
    `Q ${rightEyeCenter.x} ${rightEyeCenter.y + parameters.rightEyeOpenness * 0.4}, ${p(face.rightEye.outer)}`,
    `L ${p(face.noseBridge)}`,
    `C ${face.noseBridge.x - 1} ${face.noseBridge.y + 6}, ${face.noseBend.x + 1} ${face.noseBend.y - 2}, ${p(face.noseTip)}`,
    `L ${p(noseRight)}`,
    `L ${p(noseBottom)}`,
    `L ${p(noseLeft)}`,
    `L ${p(face.noseTip)}`,
    `L ${p(mouthRight)}`,
    `C ${mouthRight.x + 0.5} ${mouthRight.y + 2}, ${mouthCenter.x + rightMouthWidth * 0.52} ${mouthCenter.y + mouthDepth}, ${mouthCenter.x + parameters.asymmetry * 0.4} ${mouthCenter.y + 2}`,
    `C ${mouthCenter.x - leftMouthWidth * 0.52} ${mouthCenter.y + mouthDepth + parameters.asymmetry * 0.5}, ${mouthLeft.x - 0.5} ${mouthLeft.y + 2}, ${p(mouthLeft)}`,
    `L ${p(face.leftEye.inner)}`,
    `Q ${leftEyeCenter.x} ${leftEyeCenter.y - parameters.leftEyeOpenness * 0.72}, ${p(face.leftEye.outer)}`,
    `Q ${leftEyeCenter.x} ${leftEyeCenter.y + parameters.leftEyeOpenness * 0.4}, ${p(face.leftEye.inner)}`,
    `L ${p(leftEarInner)}`,
    `Q ${leftEarTip.x + 1.2} ${leftEarTip.y + 4.2}, ${p(leftEarTip)}`,
    `Q ${leftEarBase.x - 0.8} ${leftEarBase.y - 7.5}, ${p(leftEarBase)}`,
    `C ${face.leftCheek.x - 4} ${face.leftCheek.y + 7}, ${face.leftJaw.x + 2} ${face.leftJaw.y + 2}, ${p(face.neckLeft)}`,
  ].join(' ')

  return (
    <svg
      aria-labelledby={`${titleId} ${descriptionId}`}
      className="h-full w-full"
      ref={svgRef}
      role="img"
      viewBox="0 0 100 100"
    >
      <title id={titleId}>{`${name || 'anonymous visitor'} as a cat`}</title>
      <desc id={descriptionId}>
        {`A deterministic hand-drawn cat portrait made from one continuous animated SVG path with checksum ${config.checksum}.`}
      </desc>
      <path
        className={styles.line}
        d={line}
        fill="none"
        pathLength={1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={parameters.lineWidth}
        style={{ '--draw-duration': '2600ms' } as CSSProperties}
        transform={`rotate(${parameters.headTilt} 50 52)`}
      />
    </svg>
  )
}
