import { generateSingleLineFace } from '../generate-single-line-face'
import type { GuestbookEntryView } from '../../lib/guestbook'
import { SingleLineCat } from '../single-line-cat'
import { SingleLineFace } from '../single-line-face'

type RollSheetProps = {
  entries: GuestbookEntryView[]
}

export function RollSheet({ entries }: RollSheetProps) {
  if (entries.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center font-mono text-[0.68rem] tracking-[0.06em] text-muted lowercase">
        <p className="m-0 max-w-[28ch] leading-[1.7]">
          nobody has signed yet. draw a name on /input and be the first line on the sheet.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid min-h-0 flex-1 list-none grid-cols-4 content-start overflow-y-auto bg-background max-[900px]:grid-cols-3 max-[560px]:grid-cols-2">
      {entries.map((entry) => {
        // regenerated from the stored seed on every read: the database holds identities, not images
        const face = generateSingleLineFace(entry.seed)

        return (
          <li className="flex flex-col" key={entry.entryId}>
            <div className="aspect-square w-full">
              {entry.kind === 'cat' ? (
                <SingleLineCat config={face} name={entry.seed} />
              ) : (
                <SingleLineFace config={face} name={entry.seed} />
              )}
            </div>
            <p className="m-0 truncate px-2 pb-2 text-center font-mono text-[0.6rem] tracking-[0.05em] text-muted lowercase">
              {entry.seed}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
