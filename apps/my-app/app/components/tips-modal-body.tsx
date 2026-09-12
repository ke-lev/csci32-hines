'use client'

import { useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'
import { ModalFooter, modalFooterControlClasses, ModalFrame } from './modal-frame'
import { submitTipIdea } from './submit-tip-idea'

type TipsView = 'menu' | 'ideas' | 'money'
type SubmitStatus = 'idle' | 'submitting' | 'submitted' | 'error'

const paymentUrl = process.env.NEXT_PUBLIC_TIPS_URL ?? ''
const qrSrc = '/$ke1ev-cashapp-qr.svg'

const viewCopy = {
  menu: {
    title: 'leave a tip',
    description: 'pick your preferred currency',
  },
  ideas: {
    title: 'ideas',
    description: 'whatever you want to see next on this site',
  },
  money: {
    title: 'money',
    description: 'scan the code to tip me on cash app',
  },
} satisfies Record<TipsView, { title: string; description: string }>

function htmlToMarkdown(element: HTMLElement) {
  function render(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(render).join('')

    const content = Array.from(node.childNodes).map(render).join('')
    if (node.tagName === 'BR') return '\n'
    if (node.tagName === 'STRONG' || node.tagName === 'B') return `**${content}**`
    if (node.tagName === 'EM' || node.tagName === 'I') return `*${content}*`
    if (node.tagName === 'CODE') return `\`${content}\``
    if (node.tagName === 'A') return `[${content}](${node.getAttribute('href') ?? ''})`
    if (node.tagName === 'DIV' || node.tagName === 'P') return `${content}\n\n`
    return content
  }

  return Array.from(element.childNodes)
    .map(render)
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

type TipsDialogProps = {
  onClose: () => void
}

export function TipsDialog({ onClose }: TipsDialogProps) {
  const [view, setView] = useState<TipsView>('menu')
  const [feedbackText, setFeedbackText] = useState('')
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitError, setSubmitError] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  function changeView(nextView: TipsView) {
    setView(nextView)
    setSubmitStatus('idle')
    setSubmitError('')
  }

  async function sendIdea() {
    const editor = editorRef.current
    if (!editor || !feedbackText.trim() || submitStatus === 'submitting') return

    setSubmitStatus('submitting')
    setSubmitError('')

    try {
      const result = await submitTipIdea(htmlToMarkdown(editor))

      if (result.ok) {
        setSubmitStatus('submitted')
        setFeedbackText('')
        editor.replaceChildren()
        return
      }

      setSubmitStatus('error')
      setSubmitError(result.reason)
    } catch {
      setSubmitStatus('error')
      setSubmitError('could not send that idea')
    }
  }

  const currentView = viewCopy[view]

  return (
    <ModalFrame ariaDescribedBy="tips-dialog-description" ariaLabelledBy="tips-dialog-title" onClose={onClose}>
      <div className="tips-view-enter flex min-h-0 flex-1 flex-col" key={view}>
        <header className="relative shrink-0 border-b border-line px-6 pt-5 pb-5 sm:px-8 sm:pt-6">
          <p className="mb-4 font-mono text-[0.64rem] font-semibold tracking-[0.11em] text-foreground">
            users/kelev/tips
          </p>
          <h2
            className="m-0 max-w-[12ch] text-[clamp(1.9rem,6vw,2.6rem)] leading-[0.95] font-[520] tracking-[-0.05em]"
            id="tips-dialog-title"
          >
            {currentView.title}
          </h2>
          <p
            className="mt-3 mb-0 max-w-[530px] text-[0.9rem] leading-[1.45] text-subhead text-balance"
            id="tips-dialog-description"
          >
            {currentView.description}
          </p>
          <button
            aria-label="close tips"
            className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line text-foreground transition-[background-color,border-color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
            </svg>
          </button>
        </header>

        {view === 'menu' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            <div className="group flex min-h-28 w-full flex-1 items-center justify-between gap-6 border-b border-line px-6 py-5 text-left transition-colors duration-180 hover:bg-row-hover sm:px-8 motion-reduce:transition-none">
              <span>
                <span className="block text-[1rem] font-semibold tracking-[-0.02em]">an idea</span>
                <span className="mt-1.5 block text-[0.78rem] leading-5 text-muted">
                  tell me what this site needs next
                </span>
              </span>
              <Button
                aria-label="gimme ideas"
                className="shrink-0"
                onClick={() => changeView('ideas')}
                size={Size.MEDIUM}
                type="button"
                variant={Variant.PRIMARY}
              >
                <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 16 12" width="16">
                  <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </div>
            <div className="group flex min-h-28 w-full flex-1 items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-180 hover:bg-row-hover sm:px-8 motion-reduce:transition-none">
              <span>
                <span className="block text-[1rem] font-semibold tracking-[-0.02em]">a buck</span>
                <span className="mt-1.5 block text-[0.78rem] leading-5 text-muted">keep the tiny machines running</span>
              </span>
              <Button
                aria-label="gimme money"
                className="shrink-0"
                onClick={() => changeView('money')}
                size={Size.MEDIUM}
                type="button"
                variant={Variant.PRIMARY}
              >
                <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 16 12" width="16">
                  <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </div>
          </div>
        ) : view === 'ideas' ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:px-8 sm:py-8">
              <div
                aria-describedby="markdown-shortcuts"
                aria-label="your suggestion"
                aria-multiline="true"
                autoFocus
                className="min-h-32 w-full flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-background px-4 py-3.5 text-[0.9rem] leading-6 text-foreground caret-accent outline-none transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-muted focus:border-muted"
                contentEditable
                data-placeholder="a game, an experiment, a strange button..."
                onInput={(event) => {
                  setFeedbackText(event.currentTarget.innerText)
                  setSubmitStatus('idle')
                  setSubmitError('')
                }}
                ref={editorRef}
                role="textbox"
                spellCheck="true"
                suppressContentEditableWarning
                tabIndex={0}
              />
            </div>

            <ModalFooter>
              <button className={modalFooterControlClasses} onClick={() => changeView('menu')} type="button">
                &lt; back
              </button>
              <div className="flex items-center gap-3">
                <span
                  aria-live="polite"
                  className="max-w-[18ch] text-right font-mono text-[0.6rem] text-foreground"
                  role="status"
                >
                  {submitStatus === 'submitted'
                    ? 'idea sent'
                    : submitStatus === 'error'
                      ? submitError
                      : submitStatus === 'submitting'
                        ? 'sending...'
                        : ''}
                </span>
                {feedbackText.trim() ? (
                  <Button
                    className="disabled:cursor-wait disabled:hover:translate-y-0 disabled:active:scale-100"
                    disabled={submitStatus === 'submitting'}
                    onClick={sendIdea}
                    size={Size.SMALL}
                    type="button"
                    variant={Variant.PRIMARY}
                  >
                    send idea
                  </Button>
                ) : (
                  <button className={modalFooterControlClasses} disabled type="button">
                    send idea
                  </button>
                )}
              </div>
            </ModalFooter>
          </>
        ) : (
          <>
            <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto overscroll-contain px-6 py-6 min-[360px]:grid-cols-[minmax(0,1fr)_144px] min-[360px]:items-center sm:grid-cols-[1fr_200px] sm:gap-7 sm:px-8 sm:py-8">
              <p className="m-0 max-w-[25ch] text-[0.86rem] leading-6 text-muted">
                no pressure. the code goes straight to <span className="text-foreground">$ke1ev</span>
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Cash App QR code for $ke1ev"
                className="aspect-square w-full rounded-2xl border border-line bg-black p-3"
                height="288"
                src={qrSrc}
                width="288"
              />
            </div>

            <ModalFooter>
              <button className={modalFooterControlClasses} onClick={() => changeView('menu')} type="button">
                &lt; back
              </button>
              {paymentUrl ? (
                <a className={modalFooterControlClasses} href={paymentUrl} rel="noreferrer" target="_blank">
                  open Cash App ↗
                </a>
              ) : null}
            </ModalFooter>
          </>
        )}
      </div>
    </ModalFrame>
  )
}
