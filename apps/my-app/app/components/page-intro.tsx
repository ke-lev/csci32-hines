import type { ReactNode } from 'react'

type PageIntroProps = {
  body?: ReactNode
  children?: ReactNode
  subhead: ReactNode
  title: ReactNode
  titleId: string
}

export function PageIntro({ body, children, subhead, title, titleId }: PageIntroProps) {
  return (
    <div className="self-center">
      <h1
        className="page-intro-title m-0 max-w-[900px] text-[clamp(4.1rem,8.7vw,9rem)] leading-[0.84] font-[520] tracking-[-0.078em] max-[900px]:text-[clamp(4rem,14vw,7rem)] max-[560px]:text-[clamp(3.65rem,18vw,5.5rem)] max-[560px]:leading-[0.88]"
        id={titleId}
      >
        {title}
      </h1>
      <p className="page-intro-description mt-8 max-w-[530px] text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.55] text-subhead text-balance">
        {subhead}
      </p>
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
