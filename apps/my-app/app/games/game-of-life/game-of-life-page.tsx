'use client'

import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { PageIntro } from '../../components/page-intro'
import { PageShell } from '../../components/page-shell'

const columns = 24
const rows = 18
const tickLength = 180

const pageInfo = [
  '/games/game-of-life',
  'every 180 milliseconds the grid computes a new generation. a live cell survives with two or three live neighbors; a dead cell is born with exactly three; every other cell dies or stays empty.',
  '**edges are edges:** the grid does not wrap. neighbors beyond the border count as empty space. the loop pauses while the tab is hidden and resumes when you return.',
]

type Cells = boolean[]

function emptyCells(): Cells {
  return Array.from({ length: columns * rows }, () => false)
}

function seededCells(): Cells {
  const cells = emptyCells()
  const originColumn = Math.floor(columns / 2) - 1
  const originRow = Math.floor(rows / 2) - 1
  const glider = [
    [1, 0],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ]

  glider.forEach(([column, row]) => {
    cells[(originRow + row) * columns + originColumn + column] = true
  })

  return cells
}

function nextGeneration(cells: Cells): Cells {
  return cells.map((alive, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns
    let neighbors = 0

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset === 0 && columnOffset === 0) continue

        const neighborRow = row + rowOffset
        const neighborColumn = column + columnOffset
        if (neighborRow < 0 || neighborRow >= rows || neighborColumn < 0 || neighborColumn >= columns) continue

        if (cells[neighborRow * columns + neighborColumn]) neighbors += 1
      }
    }

    return neighbors === 3 || (alive && neighbors === 2)
  })
}

function paintColony(cells: Cells, index: number, alive: boolean): Cells {
  const next = [...cells]
  const selectedRow = Math.floor(index / columns)
  const selectedColumn = index % columns
  const startRow = Math.min(selectedRow, rows - 2)
  const startColumn = Math.min(selectedColumn, columns - 2)

  for (let rowOffset = 0; rowOffset < 2; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < 2; columnOffset += 1) {
      next[(startRow + rowOffset) * columns + startColumn + columnOffset] = alive
    }
  }

  return next
}

export function GameOfLifePage() {
  const [cells, setCells] = useState<Cells>(seededCells)

  useEffect(() => {
    let timer = 0

    function start() {
      if (timer) return
      timer = window.setInterval(() => {
        setCells((current) => nextGeneration(current))
      }, tickLength)
    }

    function stop() {
      window.clearInterval(timer)
      timer = 0
    }

    function syncWithVisibility() {
      if (document.visibilityState === 'visible') start()
      else stop()
    }

    syncWithVisibility()
    document.addEventListener('visibilitychange', syncWithVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', syncWithVisibility)
    }
  }, [])

  function paintCell(index: number, alive: boolean) {
    setCells((current) => paintColony(current, index, alive))
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'kelev', href: '/' },
        { label: 'games', href: '/games/' },
        { label: 'life', href: '/games/game-of-life/' },
      ]}
      info={pageInfo}
      titleId="life-title"
      left={
        <PageIntro
          title="conway's game of life"
          titleId="life-title"
          subhead="a zero-player game - just click n' drag "
          body={'paint or erase 2×2 patches by clicking and dragging, then watch the colony evolve.'}
        >
          <Button
            className="mt-7"
            href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
            size={Size.MEDIUM}
            variant={Variant.PRIMARY}
          >
            learn more
          </Button>
        </PageIntro>
      }
      right={<LifeField cells={cells} onPaintCell={paintCell} />}
      rightInset={false}
    />
  )
}

type LifeFieldProps = {
  cells: Cells
  onPaintCell: (index: number, alive: boolean) => void
}

type PaintGesture = {
  alive: boolean
  lastIndex: number
  pointerId: number
}

function LifeField({ cells, onPaintCell }: LifeFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const paintGesture = useRef<PaintGesture | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  function moveFocus(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const row = Math.floor(index / columns)
    const column = index % columns
    const destinations: Record<string, number | undefined> = {
      ArrowUp: row > 0 ? index - columns : undefined,
      ArrowDown: row < rows - 1 ? index + columns : undefined,
      ArrowLeft: column > 0 ? index - 1 : undefined,
      ArrowRight: column < columns - 1 ? index + 1 : undefined,
      Home: row * columns,
      End: row * columns + columns - 1,
    }
    const destination = destinations[event.key]

    if (destination === undefined) return

    event.preventDefault()
    setFocusedIndex(destination)
    fieldRef.current?.querySelector<HTMLButtonElement>(`[data-cell-index="${destination}"]`)?.focus()
  }

  function cellIndexAtPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-cell-index]')

    if (!element || !fieldRef.current?.contains(element)) return null

    const index = Number(element.dataset.cellIndex)
    return Number.isInteger(index) ? index : null
  }

  function beginPainting(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return

    const index = cellIndexAtPoint(event.clientX, event.clientY)
    if (index === null) return

    const alive = !cells[index]
    paintGesture.current = { alive, lastIndex: index, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    onPaintCell(index, alive)
  }

  function continuePainting(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = paintGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const index = cellIndexAtPoint(event.clientX, event.clientY)
    if (index === null || index === gesture.lastIndex) return

    gesture.lastIndex = index
    onPaintCell(index, gesture.alive)
  }

  function finishPainting(event: ReactPointerEvent<HTMLDivElement>) {
    if (paintGesture.current?.pointerId !== event.pointerId) return

    paintGesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyboardClick(event: MouseEvent<HTMLButtonElement>, index: number) {
    if (event.detail === 0) onPaintCell(index, !cells[index])
  }

  return (
    <div
      ref={fieldRef}
      aria-describedby="life-field-instructions"
      aria-label="Conway’s Game of Life field"
      className="grid h-full w-full touch-none select-none gap-px bg-line"
      onPointerCancel={finishPainting}
      onPointerDown={beginPainting}
      onPointerMove={continuePainting}
      onPointerUp={finishPainting}
      role="group"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {cells.map((alive, index) => {
        const row = Math.floor(index / columns) + 1
        const column = (index % columns) + 1

        return (
          <button
            aria-label={`row ${row}, column ${column}: ${alive ? 'alive; activate to erase a colony' : 'dead; activate to plant a colony'}`}
            aria-pressed={alive}
            className="group/cell relative min-w-0 cursor-crosshair border-0 bg-background p-0 outline-none after:absolute after:inset-[24%] after:rounded-[1px] after:bg-line after:opacity-0 after:transition-opacity after:duration-100 hover:after:opacity-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-reduce:after:transition-none"
            data-cell-index={index}
            key={index}
            onClick={(event) => handleKeyboardClick(event, index)}
            onFocus={() => setFocusedIndex(index)}
            onKeyDown={(event) => moveFocus(event, index)}
            tabIndex={index === focusedIndex ? 0 : -1}
            type="button"
          >
            <span
              className={`absolute inset-[13%] rounded-[1px] bg-foreground transition-[transform,opacity] duration-180 ease-out motion-reduce:transition-none ${alive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
              aria-hidden="true"
            />
          </button>
        )
      })}
      <p className="sr-only" id="life-field-instructions">
        The simulation runs automatically. Use the arrow keys to move between cells, and Home or End to jump to the
        start or end of a row. Activate a dead cell to plant a stable two by two colony. Activate a live cell to erase
        that area. Pointer users can drag to paint continuously.
      </p>
    </div>
  )
}
