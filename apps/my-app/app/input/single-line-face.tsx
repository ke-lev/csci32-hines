import type { CSSProperties, Ref } from 'react'
import type { FaceConfig, Point } from './face-types'
import styles from './live-drawing.module.css'

type SingleLineFaceProps = {
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

export function SingleLineFace({ config, name, svgRef }: SingleLineFaceProps) {
  const { landmarks: face, parameters } = config
  const titleId = `single-line-title-${config.checksum}`
  const descriptionId = `single-line-description-${config.checksum}`
  const leftEyeCenter = midpoint(face.leftEye.outer, face.leftEye.inner)
  const rightEyeCenter = midpoint(face.rightEye.inner, face.rightEye.outer)
  const crownReach = parameters.skullWidth * 0.34
  const leftCrownX = face.skullTop.x - crownReach
  const rightCrownX = face.skullTop.x + crownReach

  // One path, one M command, and no hidden connector paths: this is a real blind-contour drawing.
  const line = [
    `M ${p(face.neckLeft)}`,
    `C ${face.neckLeft.x - 1} ${face.neckLeft.y - 8}, ${face.leftJaw.x + 1} ${face.leftJaw.y + 5}, ${p(face.leftJaw)}`,
    `C ${face.leftJaw.x - 1} ${face.leftJaw.y - 5}, ${face.leftCheek.x - 1} ${face.leftCheek.y + 7}, ${p(face.leftCheek)}`,
    `C ${face.leftCheek.x - 1} ${face.leftCheek.y - 5}, ${face.leftTemple.x - 2} ${face.leftTemple.y + 8}, ${p(face.leftTemple)}`,
    `C ${face.leftTemple.x - 1} ${face.leftTemple.y - 8}, ${leftCrownX} ${face.skullTop.y - 1}, ${p(face.skullTop)}`,
    `C ${rightCrownX} ${face.skullTop.y - 1}, ${face.rightTemple.x + 1} ${face.rightTemple.y - 8}, ${p(face.rightTemple)}`,
    `C ${face.rightTemple.x + 2} ${face.rightTemple.y + 8}, ${face.rightCheek.x + 1} ${face.rightCheek.y - 5}, ${p(face.rightCheek)}`,
    `C ${face.rightCheek.x + 1} ${face.rightCheek.y + 7}, ${face.rightJaw.x + 1} ${face.rightJaw.y - 5}, ${p(face.rightJaw)}`,
    `C ${face.rightJaw.x - 1} ${face.rightJaw.y + 5}, ${face.neckRight.x + 1} ${face.neckRight.y - 8}, ${p(face.neckRight)}`,
    `C ${face.neckRight.x - 1} ${face.neckRight.y - 9}, ${face.rightJaw.x - 3} ${face.rightJaw.y + 3}, ${p(face.rightJaw)}`,
    `C ${face.rightJaw.x + 4} ${face.rightJaw.y - 9}, ${face.rightEar.bottom.x + 1} ${face.rightEar.bottom.y + 3}, ${p(face.rightEar.bottom)}`,
    `C ${face.rightEar.outer.x + 2} ${face.rightEar.bottom.y + 1}, ${face.rightEar.outer.x + 2} ${face.rightEar.top.y - 1}, ${p(face.rightEar.top)}`,
    `C ${face.rightEar.inner.x} ${face.rightEar.top.y + 3}, ${face.rightEar.inner.x + 1} ${face.rightEar.bottom.y - 3}, ${p(face.rightEar.inner)}`,
    `L ${p(face.rightBrow.outer)}`,
    `Q ${rightEyeCenter.x} ${face.rightBrow.inner.y - 2}, ${p(face.rightBrow.inner)}`,
    `L ${p(face.rightEye.inner)}`,
    `Q ${rightEyeCenter.x} ${rightEyeCenter.y - parameters.rightEyeOpenness}, ${p(face.rightEye.outer)}`,
    `Q ${rightEyeCenter.x} ${rightEyeCenter.y + parameters.rightEyeOpenness * 0.58}, ${p(face.rightEye.inner)}`,
    `L ${p(face.noseBridge)}`,
    `C ${face.noseBridge.x - 1} ${face.noseBridge.y + 6}, ${face.noseBend.x + 1} ${face.noseBend.y - 2}, ${p(face.noseBend)}`,
    `C ${face.noseBend.x} ${face.noseBend.y + 4}, ${face.noseTip.x + 2} ${face.noseTip.y - 2}, ${p(face.noseTip)}`,
    `C ${face.noseTip.x - 2} ${face.noseTip.y + 2}, ${face.noseLeft.x + 1} ${face.noseLeft.y + 1}, ${p(face.noseLeft)}`,
    `C ${face.noseTip.x} ${face.noseTip.y + 4}, ${face.noseRight.x - 1} ${face.noseRight.y + 1}, ${p(face.noseRight)}`,
    `L ${p(face.mouthRight)}`,
    `C ${face.mouthRight.x - 4} ${face.mouthRight.y - parameters.mouthCurvature * 0.28}, ${face.mouthCenter.x + 3} ${face.mouthCenter.y}, ${p(face.mouthCenter)}`,
    `C ${face.mouthCenter.x - 3} ${face.mouthCenter.y}, ${face.mouthLeft.x + 4} ${face.mouthLeft.y - parameters.mouthCurvature * 0.35}, ${p(face.mouthLeft)}`,
    `Q ${face.mouthLower.x} ${face.mouthLower.y}, ${p(face.mouthRight)}`,
    `L ${p(face.chinRight)}`,
    `C ${face.chinRight.x - 4} ${face.chinRight.y + 5}, ${face.chinTip.x + 5} ${face.chinTip.y}, ${p(face.chinTip)}`,
    `C ${face.chinTip.x - 5} ${face.chinTip.y}, ${face.chinLeft.x + 4} ${face.chinLeft.y + 5}, ${p(face.chinLeft)}`,
    `L ${p(face.mouthLeft)}`,
    `L ${p(face.noseLeft)}`,
    `L ${p(face.leftEye.inner)}`,
    `Q ${leftEyeCenter.x} ${leftEyeCenter.y - parameters.leftEyeOpenness}, ${p(face.leftEye.outer)}`,
    `Q ${leftEyeCenter.x} ${leftEyeCenter.y + parameters.leftEyeOpenness * 0.58}, ${p(face.leftEye.inner)}`,
    `L ${p(face.leftBrow.inner)}`,
    `Q ${leftEyeCenter.x} ${face.leftBrow.outer.y - 2}, ${p(face.leftBrow.outer)}`,
    `L ${p(face.leftEar.top)}`,
    `C ${face.leftEar.outer.x - 2} ${face.leftEar.top.y - 1}, ${face.leftEar.outer.x - 2} ${face.leftEar.bottom.y + 1}, ${p(face.leftEar.bottom)}`,
    `C ${face.leftEar.inner.x - 1} ${face.leftEar.bottom.y - 3}, ${face.leftEar.inner.x} ${face.leftEar.top.y + 3}, ${p(face.leftEar.inner)}`,
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
      <title id={titleId}>{`${name || 'anonymous visitor'}, you handsome devil you`}</title>
      <desc id={descriptionId}>
        {`A deterministic human portrait made from one continuous animated SVG path with checksum ${config.checksum}.`}
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
