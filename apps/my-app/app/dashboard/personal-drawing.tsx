'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import {
  countPoints,
  fromStoredStrokes,
  MAX_POINTS_PER_STROKE,
  MAX_STROKE_COUNT,
  MAX_TOTAL_POINTS,
  storedStrokesMatch,
  toStoredStrokes,
  VIEW_BOX_HEIGHT,
  VIEW_BOX_WIDTH,
  type DrawingPoint,
  type DrawingStroke,
  type StoredStroke,
} from '../lib/personal-page'
import type { SaveDrawingResult } from './use-personal-page'

type DrawingHistory = {
  entries: DrawingStroke[][]
  index: number
}

type PersonalDrawingProps = {
  isReady: boolean
  loadError: string | null
  onSubmit: (strokes: StoredStroke[]) => Promise<SaveDrawingResult>
  savedStrokes: StoredStroke[] | null
}

const minimumPointDistance = 2.5
const maxHistoryEntries = 80

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function distanceBetween(first: DrawingPoint, second: DrawingPoint) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

function midpointBetween(first: DrawingPoint, second: DrawingPoint): DrawingPoint {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function getPointInViewBox(event: ReactPointerEvent<SVGSVGElement>, svg: SVGSVGElement): DrawingPoint {
  const bounds = svg.getBoundingClientRect()

  return {
    x: clamp(((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * VIEW_BOX_WIDTH, 0, VIEW_BOX_WIDTH),
    y: clamp(((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * VIEW_BOX_HEIGHT, 0, VIEW_BOX_HEIGHT),
  }
}

function formatPoint(point: DrawingPoint) {
  return `${point.x.toFixed(1)} ${point.y.toFixed(1)}`
}

// quadratic segments through the midpoints round the sampled polyline off without moving the pen
function strokeToPath(stroke: DrawingStroke) {
  const firstPoint = stroke[0]

  if (!firstPoint) return ''
  if (stroke.length === 1) return `M ${formatPoint(firstPoint)} l 0.1 0.1`

  const lastPoint = stroke[stroke.length - 1]

  if (!lastPoint) return ''
  if (stroke.length === 2) return `M ${formatPoint(firstPoint)} L ${formatPoint(lastPoint)}`

  let path = `M ${formatPoint(firstPoint)}`

  for (let index = 1; index < stroke.length - 1; index += 1) {
    const controlPoint = stroke[index]
    const nextPoint = stroke[index + 1]

    if (!controlPoint || !nextPoint) continue

    path += ` Q ${formatPoint(controlPoint)} ${formatPoint(midpointBetween(controlPoint, nextPoint))}`
  }

  return `${path} L ${formatPoint(lastPoint)}`
}

const glyphButtonClassName =
  'inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-180 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-25 disabled:hover:text-muted motion-reduce:transition-none'

function UndoGlyph() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 14 4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RedoGlyph() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m15 14 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

export function PersonalDrawing({ isReady, loadError, onSubmit, savedStrokes }: PersonalDrawingProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const activePathRef = useRef<SVGPathElement>(null)
  const activeStrokeRef = useRef<DrawingStroke | null>(null)
  const activePointerIdRef = useRef<number | null>(null)
  // null history means untouched: the pad shows whatever the account has saved, so a drawing that
  // arrives mid-session appears without overwriting strokes the visitor already made
  const [history, setHistory] = useState<DrawingHistory | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const savedHistory = useMemo(
    (): DrawingHistory => ({ entries: [savedStrokes ? fromStoredStrokes(savedStrokes) : []], index: 0 }),
    [savedStrokes],
  )
  const resolveHistory = useCallback(
    (currentHistory: DrawingHistory | null) => currentHistory ?? savedHistory,
    [savedHistory],
  )

  const activeHistory = history ?? savedHistory
  const strokes = useMemo(() => activeHistory.entries[activeHistory.index] ?? [], [activeHistory])
  const hasDrawing = strokes.length > 0
  const canUndo = activeHistory.index > 0
  const canRedo = activeHistory.index < activeHistory.entries.length - 1

  const storedStrokes = useMemo(() => toStoredStrokes(strokes), [strokes])
  // a null savedStrokes means the stored drawing is unknown, so anything on the pad counts as work
  const hasUnsavedChanges =
    savedStrokes === null ? hasDrawing : !storedStrokesMatch(storedStrokes, savedStrokes)

  useEffect(() => {
    return () => {
      activeStrokeRef.current = null
      activePointerIdRef.current = null
    }
  }, [])

  const clearActivePath = useCallback(() => {
    activeStrokeRef.current = null
    activePointerIdRef.current = null
    activePathRef.current?.removeAttribute('d')
    setIsDrawing(false)
  }, [])

  const cancelActiveStroke = useCallback(() => {
    const svg = svgRef.current
    const pointerId = activePointerIdRef.current

    if (svg && pointerId !== null && svg.hasPointerCapture(pointerId)) {
      svg.releasePointerCapture(pointerId)
    }

    clearActivePath()
  }, [clearActivePath])

  function commitStrokes(nextStrokes: DrawingStroke[]) {
    setSaveError(null)
    setSaveMessage(null)
    setHistory((currentHistory) => {
      const previousHistory = resolveHistory(currentHistory)
      const entries = [...previousHistory.entries.slice(0, previousHistory.index + 1), nextStrokes].slice(
        -maxHistoryEntries,
      )

      return { entries, index: entries.length - 1 }
    })
  }

  function startStroke(event: ReactPointerEvent<SVGSVGElement>) {
    if (!isReady || !event.isPrimary || event.button !== 0) return
    if (strokes.length >= MAX_STROKE_COUNT || countPoints(strokes) >= MAX_TOTAL_POINTS) return

    const point = getPointInViewBox(event, event.currentTarget)
    const nextStroke = [point]

    activeStrokeRef.current = nextStroke
    activePointerIdRef.current = event.pointerId
    activePathRef.current?.setAttribute('d', strokeToPath(nextStroke))
    setIsDrawing(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function continueStroke(event: ReactPointerEvent<SVGSVGElement>) {
    const activeStroke = activeStrokeRef.current

    if (!activeStroke || activePointerIdRef.current !== event.pointerId) return

    const nextPoint = getPointInViewBox(event, event.currentTarget)
    const previousPoint = activeStroke[activeStroke.length - 1]

    if (previousPoint && distanceBetween(previousPoint, nextPoint) < minimumPointDistance) return
    if (activeStroke.length >= MAX_POINTS_PER_STROKE) return
    if (countPoints(strokes) + activeStroke.length >= MAX_TOTAL_POINTS) return

    activeStroke.push(nextPoint)
    activePathRef.current?.setAttribute('d', strokeToPath(activeStroke))
  }

  function finishStroke(event: ReactPointerEvent<SVGSVGElement>, commit: boolean) {
    if (activePointerIdRef.current !== event.pointerId) return

    const completedStroke = activeStrokeRef.current

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    clearActivePath()

    if (commit && completedStroke?.length) {
      commitStrokes([...strokes, completedStroke])
    }
  }

  function scrapDrawing() {
    cancelActiveStroke()
    if (hasDrawing) commitStrokes([])
  }

  async function submitDrawing() {
    cancelActiveStroke()
    setIsSaving(true)
    setSaveError(null)
    setSaveMessage(null)

    const result = await onSubmit(storedStrokes)

    setIsSaving(false)

    if (result.ok) {
      setSaveMessage(storedStrokes.length ? 'drawing saved' : 'drawing cleared')
      return
    }

    // the pad keeps the strokes it has, so a failed save can be retried without redrawing
    setSaveError(result.reason)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.metaKey && !event.ctrlKey) return
      if (event.altKey) return
      if (isTextEntryTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (key !== 'z' && key !== 'y') return

      const isRedo = key === 'y' || event.shiftKey

      event.preventDefault()

      setHistory((currentHistory) => {
        const previousHistory = resolveHistory(currentHistory)
        const nextIndex = previousHistory.index + (isRedo ? 1 : -1)

        if (nextIndex < 0 || nextIndex > previousHistory.entries.length - 1) return currentHistory

        return { ...previousHistory, index: nextIndex }
      })

      cancelActiveStroke()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [cancelActiveStroke, resolveHistory])

  function undo() {
    cancelActiveStroke()
    setHistory((currentHistory) => {
      const previousHistory = resolveHistory(currentHistory)

      return previousHistory.index > 0 ? { ...previousHistory, index: previousHistory.index - 1 } : currentHistory
    })
  }

  function redo() {
    cancelActiveStroke()
    setHistory((currentHistory) => {
      const previousHistory = resolveHistory(currentHistory)

      return previousHistory.index < previousHistory.entries.length - 1
        ? { ...previousHistory, index: previousHistory.index + 1 }
        : currentHistory
    })
  }

  const footerNote = saveError || saveMessage || (isSaving ? 'saving...' : loadError)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="drawing-pad relative min-h-0 flex-1">
        <svg
          aria-describedby="dashboard-drawing-help"
          aria-label="personal drawing surface"
          className="block size-full cursor-crosshair touch-none select-none text-foreground outline-none"
          preserveAspectRatio="none"
          ref={svgRef}
          role="img"
          viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          onPointerCancel={(event) => finishStroke(event, false)}
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={(event) => finishStroke(event, true)}
        >
          {strokes.map((stroke, index) => (
            <path
              d={strokeToPath(stroke)}
              fill="none"
              key={index}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            aria-hidden="true"
            d=""
            fill="none"
            ref={activePathRef}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="absolute top-3 right-3 flex items-center gap-0.5">
          <button
            aria-label="undo"
            className={glyphButtonClassName}
            disabled={!isReady || !canUndo}
            onClick={undo}
            type="button"
          >
            <UndoGlyph />
          </button>
          <button
            aria-label="redo"
            className={glyphButtonClassName}
            disabled={!isReady || !canRedo}
            onClick={redo}
            type="button"
          >
            <RedoGlyph />
          </button>
        </div>

        {!hasDrawing && !isDrawing ? (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 grid place-items-center px-6 text-center font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase"
          >
            {isReady ? 'drag here to draw' : 'checking credentials...'}
          </p>
        ) : null}
      </div>

      <p className="sr-only" id="dashboard-drawing-help">
        use a mouse, pen, or touch input to draw. undo and redo with control or command z, submit saves the drawing to
        your account, and scrap clears the pad.
      </p>

      <div className="flex items-center justify-between gap-4 border-t border-line px-[clamp(18px,2vw,28px)] py-4">
        <p
          className={`m-0 min-w-0 truncate font-mono text-[0.64rem] tracking-[0.06em] lowercase ${saveError || (loadError && !saveMessage && !isSaving) ? 'text-danger' : 'text-muted'}`}
          role="status"
        >
          {footerNote}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            className="disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={!isReady || isSaving || !hasDrawing}
            onClick={scrapDrawing}
            size={Size.MEDIUM}
            variant={Variant.SECONDARY}
          >
            scrap
          </Button>
          <Button
            className="disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
            disabled={!isReady || isSaving || !hasUnsavedChanges}
            onClick={() => void submitDrawing()}
            size={Size.MEDIUM}
            variant={Variant.PRIMARY}
          >
            submit
          </Button>
        </div>
      </div>
    </div>
  )
}
