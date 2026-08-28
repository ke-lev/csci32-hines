import type { FaceConfig, Point } from './face-types'

type ProceduralFaceProps = {
  config: FaceConfig
  name: string
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

export function ProceduralFace({ config, name }: ProceduralFaceProps) {
  const { landmarks: face, parameters } = config
  const titleId = `face-title-${config.checksum}`
  const descriptionId = `face-description-${config.checksum}`

  const leftEyeCenter = midpoint(face.leftEye.outer, face.leftEye.inner)
  const rightEyeCenter = midpoint(face.rightEye.inner, face.rightEye.outer)
  const leftEyeUpperY = leftEyeCenter.y - parameters.leftEyeOpenness
  const leftEyeLowerY = leftEyeCenter.y + parameters.leftEyeOpenness * 0.58
  const rightEyeUpperY = rightEyeCenter.y - parameters.rightEyeOpenness
  const rightEyeLowerY = rightEyeCenter.y + parameters.rightEyeOpenness * 0.58
  const crownReach = parameters.skullWidth * 0.34
  const leftCrownX = face.skullTop.x - crownReach
  const rightCrownX = face.skullTop.x + crownReach
  const leftPupilX = leftEyeCenter.x + parameters.asymmetry * 0.35
  const rightPupilX = rightEyeCenter.x + parameters.asymmetry * 0.2
  const pupilY = parameters.mood > 0.25 ? 0.15 : 0.55
  const wrinkleOpacity = 0.34 + parameters.wrinkleDepth * 0.42

  const outline = [
    `M ${p(face.skullTop)}`,
    `C ${leftCrownX} ${face.skullTop.y - 0.7}, ${face.leftTemple.x - 1.8} ${face.leftTemple.y - 8}, ${p(face.leftTemple)}`,
    `C ${face.leftTemple.x - 1.1} ${face.leftTemple.y + 8}, ${face.leftCheek.x - 1.2} ${face.leftCheek.y - 4}, ${p(face.leftCheek)}`,
    `C ${face.leftCheek.x - 0.3} ${face.leftCheek.y + 8}, ${face.leftJaw.x - 0.9} ${face.leftJaw.y - 4}, ${p(face.leftJaw)}`,
    `C ${face.leftJaw.x + 0.5} ${face.leftJaw.y + 6}, ${face.chinLeft.x - 1.5} ${face.chinLeft.y - 1}, ${p(face.chinLeft)}`,
    `C ${face.chinLeft.x + 4} ${face.chinLeft.y + 5}, ${face.chinTip.x - 5.5} ${face.chinTip.y}, ${p(face.chinTip)}`,
    `C ${face.chinTip.x + 5} ${face.chinTip.y + 0.2}, ${face.chinRight.x - 4} ${face.chinRight.y + 5}, ${p(face.chinRight)}`,
    `C ${face.chinRight.x + 1.5} ${face.chinRight.y - 1}, ${face.rightJaw.x - 0.5} ${face.rightJaw.y + 6}, ${p(face.rightJaw)}`,
    `C ${face.rightJaw.x + 0.9} ${face.rightJaw.y - 4}, ${face.rightCheek.x + 0.3} ${face.rightCheek.y + 8}, ${p(face.rightCheek)}`,
    `C ${face.rightCheek.x + 1.2} ${face.rightCheek.y - 4}, ${face.rightTemple.x + 1.1} ${face.rightTemple.y + 8}, ${p(face.rightTemple)}`,
    `C ${face.rightTemple.x + 1.8} ${face.rightTemple.y - 8}, ${rightCrownX} ${face.skullTop.y - 1}, ${p(face.skullTop)}`,
  ].join(' ')

  const leftEar = `M ${p(face.leftEar.top)} C ${face.leftEar.outer.x - 1.2} ${face.leftEar.top.y - 1}, ${face.leftEar.outer.x - 1.2} ${face.leftEar.bottom.y + 1}, ${p(face.leftEar.bottom)} C ${face.leftEar.inner.x} ${face.leftEar.bottom.y - 3}, ${face.leftEar.inner.x - 1.3} ${face.leftEar.top.y + 4}, ${p(face.leftEar.inner)}`
  const rightEar = `M ${p(face.rightEar.top)} C ${face.rightEar.outer.x + 1.2} ${face.rightEar.top.y - 1}, ${face.rightEar.outer.x + 1.2} ${face.rightEar.bottom.y + 1}, ${p(face.rightEar.bottom)} C ${face.rightEar.inner.x} ${face.rightEar.bottom.y - 3}, ${face.rightEar.inner.x + 1.3} ${face.rightEar.top.y + 4}, ${p(face.rightEar.inner)}`

  const hairline = face.hairline
  const hairPath = `M ${p(hairline[0])} C ${hairline[1].x - 2} ${hairline[1].y - 2}, ${hairline[1].x + 1} ${hairline[1].y + 1}, ${p(hairline[2])} C ${hairline[3].x - 1} ${hairline[3].y + 1}, ${hairline[3].x + 2} ${hairline[3].y - 2}, ${p(hairline[4])}`

  return (
    <svg
      aria-labelledby={`${titleId} ${descriptionId}`}
      className="procedural-face h-full w-full"
      role="img"
      viewBox="0 0 100 100"
    >
      <title id={titleId}>{`${name || 'anonymous visitor'}, drawn from a deterministic name seed`}</title>
      <desc id={descriptionId}>
        {`A crude asymmetrical line-drawn face with checksum ${config.checksum}. Reusing the same name draws the same face.`}
      </desc>

      <g
        fill="none"
        stroke="#f4f4ef"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={parameters.lineWidth}
        transform={`rotate(${parameters.headTilt} 50 52)`}
      >
        <path d={outline} />
        <path d={leftEar} opacity="0.84" />
        <path d={rightEar} opacity="0.84" />

        <path
          d={`M ${face.leftJaw.x + 2.2} ${face.leftJaw.y + 5.2} C ${face.leftJaw.x + 5} ${face.chinTip.y - 1}, ${face.neckLeft.x - 1} ${face.neckLeft.y - 4}, ${p(face.neckLeft)}`}
          opacity="0.82"
        />
        <path
          d={`M ${face.rightJaw.x - 2} ${face.rightJaw.y + 5.4} C ${face.rightJaw.x - 5} ${face.chinTip.y - 1}, ${face.neckRight.x + 1} ${face.neckRight.y - 4}, ${p(face.neckRight)}`}
          opacity="0.82"
        />

        <path d={`M ${p(face.leftEye.outer)} Q ${leftEyeCenter.x} ${leftEyeUpperY}, ${p(face.leftEye.inner)}`} />
        <path
          d={`M ${p(face.leftEye.inner)} Q ${leftEyeCenter.x} ${leftEyeLowerY}, ${p(face.leftEye.outer)}`}
          opacity="0.74"
        />
        <path d={`M ${p(face.rightEye.inner)} Q ${rightEyeCenter.x} ${rightEyeUpperY}, ${p(face.rightEye.outer)}`} />
        <path
          d={`M ${p(face.rightEye.outer)} Q ${rightEyeCenter.x} ${rightEyeLowerY}, ${p(face.rightEye.inner)}`}
          opacity="0.74"
        />

        <path
          d={`M ${leftPupilX - 0.8} ${leftEyeCenter.y + pupilY - 0.4} Q ${leftPupilX + 0.15} ${leftEyeCenter.y + pupilY - 1.2}, ${leftPupilX + 0.7} ${leftEyeCenter.y + pupilY + 0.2} Q ${leftPupilX - 0.05} ${leftEyeCenter.y + pupilY + 1.15}, ${leftPupilX - 0.8} ${leftEyeCenter.y + pupilY - 0.4} Z`}
          fill="#f4f4ef"
          stroke="none"
        />
        <path
          d={`M ${rightPupilX - 0.7} ${rightEyeCenter.y + pupilY - 0.3} Q ${rightPupilX + 0.25} ${rightEyeCenter.y + pupilY - 1.15}, ${rightPupilX + 0.8} ${rightEyeCenter.y + pupilY + 0.3} Q ${rightPupilX} ${rightEyeCenter.y + pupilY + 1.1}, ${rightPupilX - 0.7} ${rightEyeCenter.y + pupilY - 0.3} Z`}
          fill="#f4f4ef"
          stroke="none"
        />

        <path
          d={`M ${p(face.leftBrow.outer)} C ${face.leftBrow.outer.x + 2.6} ${face.leftBrow.outer.y - 1.4}, ${face.leftBrow.inner.x - 2.3} ${face.leftBrow.inner.y - 0.6}, ${p(face.leftBrow.inner)}`}
          strokeWidth={parameters.lineWidth * 1.28}
        />
        <path
          d={`M ${p(face.rightBrow.inner)} C ${face.rightBrow.inner.x + 2.3} ${face.rightBrow.inner.y - 0.6}, ${face.rightBrow.outer.x - 2.6} ${face.rightBrow.outer.y - 1.4}, ${p(face.rightBrow.outer)}`}
          strokeWidth={parameters.lineWidth * 1.28}
        />

        <path
          d={`M ${p(face.noseBridge)} C ${face.noseBridge.x - 1.2} ${face.noseBridge.y + 6}, ${face.noseBend.x + 0.8} ${face.noseBend.y - 2}, ${p(face.noseBend)} C ${face.noseBend.x - 0.2} ${face.noseBend.y + 4}, ${face.noseTip.x + 1.5} ${face.noseTip.y - 1.8}, ${p(face.noseTip)}`}
        />
        <path
          d={`M ${p(face.noseLeft)} C ${face.noseLeft.x + 1.4} ${face.noseLeft.y + 1.6}, ${face.noseTip.x - 0.8} ${face.noseTip.y + 2}, ${p(face.noseTip)} C ${face.noseTip.x + 1.1} ${face.noseTip.y + 2.2}, ${face.noseRight.x - 1.4} ${face.noseRight.y + 1.6}, ${p(face.noseRight)}`}
          opacity="0.88"
        />

        <path
          d={`M ${p(face.mouthLeft)} C ${face.mouthLeft.x + 4.2} ${face.mouthLeft.y - parameters.mouthCurvature * 0.35}, ${face.mouthCenter.x - 2.6} ${face.mouthCenter.y}, ${p(face.mouthCenter)} C ${face.mouthCenter.x + 2.8} ${face.mouthCenter.y}, ${face.mouthRight.x - 4} ${face.mouthRight.y - parameters.mouthCurvature * 0.28}, ${p(face.mouthRight)}`}
        />
        <path
          d={`M ${face.mouthLeft.x + 2.5} ${face.mouthLeft.y + 1.4} Q ${face.mouthLower.x} ${face.mouthLower.y}, ${face.mouthRight.x - 2.2} ${face.mouthRight.y + 1.3}`}
          opacity="0.55"
        />

        {parameters.eyeBagDepth > 0.28 ? (
          <g opacity={Math.min(0.3 + parameters.eyeBagDepth * 0.22, 0.75)}>
            <path
              d={`M ${face.leftEye.outer.x + 0.7} ${leftEyeCenter.y + 4.2} Q ${leftEyeCenter.x} ${leftEyeCenter.y + 5.2 + parameters.eyeBagDepth}, ${face.leftEye.inner.x - 0.7} ${leftEyeCenter.y + 4}`}
            />
            <path
              d={`M ${face.rightEye.inner.x + 0.7} ${rightEyeCenter.y + 4} Q ${rightEyeCenter.x} ${rightEyeCenter.y + 5 + parameters.eyeBagDepth}, ${face.rightEye.outer.x - 0.7} ${rightEyeCenter.y + 4.3}`}
            />
          </g>
        ) : null}

        {parameters.glasses ? (
          <g strokeWidth={parameters.lineWidth * 0.82}>
            <path
              d={`M ${face.leftEye.outer.x - 2.2} ${leftEyeCenter.y - 4.5} C ${face.leftEye.outer.x - 3.2} ${leftEyeCenter.y + 4.4}, ${face.leftEye.inner.x + 1.7} ${leftEyeCenter.y + 5.2}, ${face.leftEye.inner.x + 1.8} ${leftEyeCenter.y - 4} C ${leftEyeCenter.x} ${leftEyeCenter.y - 5.4}, ${face.leftEye.outer.x - 1.4} ${leftEyeCenter.y - 5.2}, ${face.leftEye.outer.x - 2.2} ${leftEyeCenter.y - 4.5} Z`}
            />
            <path
              d={`M ${face.rightEye.inner.x - 1.8} ${rightEyeCenter.y - 4} C ${face.rightEye.inner.x - 1.7} ${rightEyeCenter.y + 5.2}, ${face.rightEye.outer.x + 3.2} ${rightEyeCenter.y + 4.4}, ${face.rightEye.outer.x + 2.2} ${rightEyeCenter.y - 4.5} C ${face.rightEye.outer.x + 1.4} ${rightEyeCenter.y - 5.2}, ${rightEyeCenter.x} ${rightEyeCenter.y - 5.4}, ${face.rightEye.inner.x - 1.8} ${rightEyeCenter.y - 4} Z`}
            />
            <path
              d={`M ${face.leftEye.inner.x + 1.4} ${leftEyeCenter.y - 1.2} Q 50 ${leftEyeCenter.y - 3.3}, ${face.rightEye.inner.x - 1.4} ${rightEyeCenter.y - 1.2}`}
            />
          </g>
        ) : null}

        {parameters.hairDensity > 0.32 ? <path d={hairPath} opacity={0.54 + parameters.hairDensity * 0.42} /> : null}
        {parameters.hairDensity > 0.62 ? (
          <g opacity="0.8">
            <path
              d={`M ${hairline[1].x - 3} ${hairline[1].y - 0.5} Q ${hairline[1].x - 5} ${hairline[1].y - 5}, ${hairline[1].x - 1.5} ${hairline[1].y - 8}`}
            />
            <path
              d={`M ${hairline[2].x - 1} ${hairline[2].y - 0.8} Q ${hairline[2].x - 0.4} ${hairline[2].y - 6}, ${hairline[2].x + 2} ${hairline[2].y - 9}`}
            />
            <path
              d={`M ${hairline[3].x + 2.5} ${hairline[3].y - 0.6} Q ${hairline[3].x + 5} ${hairline[3].y - 5}, ${hairline[3].x + 2.2} ${hairline[3].y - 8}`}
            />
          </g>
        ) : (
          <g opacity="0.64">
            <path
              d={`M ${hairline[1].x} ${hairline[1].y} Q ${hairline[1].x - 1.8} ${hairline[1].y - 3.6}, ${hairline[1].x + 0.5} ${hairline[1].y - 5.2}`}
            />
            <path
              d={`M ${hairline[3].x} ${hairline[3].y} Q ${hairline[3].x + 1.9} ${hairline[3].y - 3.2}, ${hairline[3].x - 0.3} ${hairline[3].y - 4.8}`}
            />
          </g>
        )}

        {parameters.wrinkleDepth > 0.18 ? (
          <g opacity={wrinkleOpacity} strokeWidth={parameters.lineWidth * 0.72}>
            <path
              d={`M ${hairline[1].x + 2} ${face.leftBrow.outer.y - 6} Q 50 ${face.leftBrow.outer.y - 8 - parameters.wrinkleDepth}, ${hairline[3].x - 2} ${face.rightBrow.outer.y - 6}`}
            />
            {parameters.wrinkleDepth > 0.48 ? (
              <path
                d={`M ${face.leftCheek.x + 6} ${face.noseLeft.y + 4} Q ${face.mouthLeft.x - 2} ${face.mouthLeft.y - 1}, ${face.mouthLeft.x + 1} ${face.mouthLeft.y + 5}`}
              />
            ) : null}
            {parameters.wrinkleDepth > 0.7 ? (
              <path
                d={`M ${face.rightCheek.x - 6} ${face.noseRight.y + 4} Q ${face.mouthRight.x + 2} ${face.mouthRight.y - 1}, ${face.mouthRight.x - 1} ${face.mouthRight.y + 5}`}
              />
            ) : null}
          </g>
        ) : null}

        {parameters.facialHair === 'mustache' ? (
          <g strokeWidth={parameters.lineWidth * 1.08} opacity="0.84">
            <path
              d={`M ${face.noseTip.x - 0.4} ${face.noseTip.y + 3.4} Q ${face.mouthCenter.x - 4.5} ${face.mouthLeft.y - 1.5}, ${face.mouthLeft.x + 2} ${face.mouthLeft.y + 0.2}`}
            />
            <path
              d={`M ${face.noseTip.x + 0.4} ${face.noseTip.y + 3.4} Q ${face.mouthCenter.x + 4.6} ${face.mouthRight.y - 1.5}, ${face.mouthRight.x - 2} ${face.mouthRight.y + 0.3}`}
            />
          </g>
        ) : null}
        {parameters.facialHair === 'chin' ? (
          <g opacity="0.68">
            <path
              d={`M ${face.chinLeft.x + 2} ${face.chinLeft.y + 1} Q ${face.chinTip.x - 3} ${face.chinTip.y - 6}, ${face.chinTip.x - 2} ${face.chinTip.y - 1}`}
            />
            <path
              d={`M ${face.chinTip.x} ${face.chinTip.y - 8} Q ${face.chinTip.x + 1} ${face.chinTip.y - 4}, ${face.chinTip.x} ${face.chinTip.y - 0.4}`}
            />
            <path
              d={`M ${face.chinRight.x - 2} ${face.chinRight.y + 1} Q ${face.chinTip.x + 3} ${face.chinTip.y - 6}, ${face.chinTip.x + 2} ${face.chinTip.y - 1}`}
            />
          </g>
        ) : null}
        {parameters.facialHair === 'stubble' ? (
          <g opacity="0.5" strokeWidth={parameters.lineWidth * 0.65}>
            <path
              d={`M ${face.mouthLeft.x - 2} ${face.mouthLeft.y + 7} l 0.8 1.2 M ${face.mouthLeft.x + 4} ${face.mouthLeft.y + 9} l 0.3 1.3 M ${face.mouthRight.x + 2} ${face.mouthRight.y + 7} l -0.7 1.2 M ${face.mouthRight.x - 4} ${face.mouthRight.y + 9} l -0.2 1.4 M ${face.chinTip.x - 4} ${face.chinTip.y - 5} l 0.4 1.2 M ${face.chinTip.x + 3} ${face.chinTip.y - 4} l -0.3 1.1`}
            />
          </g>
        ) : null}
      </g>
    </svg>
  )
}
