import type { ReactNode } from 'react'

type PageIntroProps = {
  body?: ReactNode
  children?: ReactNode
  isRevealed?: boolean
  subhead: ReactNode
  subheadAs?: 'h2' | 'p'
  title: ReactNode
  titleId: string
}

// the reveal is a mount animation, so a page whose copy arrives over the network would play it
// against placeholder text and be finished before the real words land. holding the class back and
// adding it when the copy is ready starts the animation then instead - no remount, no lost focus.
// pages with their copy in hand render revealed on the first paint, exactly as before.
const titleClassName =
  'm-0 max-w-[900px] text-[clamp(4.1rem,8.7vw,9rem)] leading-[0.84] font-[520] tracking-[-0.078em] max-[900px]:text-[clamp(4rem,14vw,7rem)] max-[560px]:text-[clamp(3.65rem,18vw,5.5rem)] max-[560px]:leading-[0.88]'

const descriptionClassName =
  'mt-8 max-w-[530px] text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.55] text-subhead text-balance'

export function PageIntro({
  body,
  children,
  isRevealed = true,
  subhead,
  subheadAs: Subhead = 'p',
  title,
  titleId,
}: PageIntroProps) {
  return (
    <div className="self-center">
      <h1 className={isRevealed ? `page-intro-title ${titleClassName}` : titleClassName} id={titleId}>
        {title}
      </h1>
      <Subhead className={isRevealed ? `page-intro-description ${descriptionClassName}` : descriptionClassName}>
        {subhead}
      </Subhead>
      {body &&
        (typeof body === 'string' ? (
          <p className="mt-5 max-w-[52ch] whitespace-pre-line text-sm leading-[1.6] text-muted">{body}</p>
        ) : (
          <div className="mt-5 max-w-[52ch] text-sm leading-[1.6] text-muted">{body}</div>
        ))}
      {children}
    </div>
  )
}
