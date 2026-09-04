'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'

const terms = [
  'by using, looking at, clicking on, thinking about, benefiting from, or standing anywhere near the Service, you agree to these Terms. you also agree to any other rules we have now, invent later, forgot to publish, or decide applied retroactively',
  'if you disagree, you can stop using the Service. we may still keep your data, charge you money, enforce the parts we like, and generally continue as if you had not left',
  '1. our relationship with you',
  'our relationship is built on trust, transparency, mutual value, and the understanding that all three become optional when they conflict with our interests',
  'nothing here requires us to be loyal, careful, fair, reasonable, respectful of your privacy, or interested in what is best for you',
  'we want you to make informed decisions. we also control how much information you get',
  '2. your account',
  'your account is not really yours. we are letting you use it until we decide otherwise',
  'you are responsible for everything that happens through your account, including anything caused by stolen credentials, unauthorized access, confusing design, bad defaults, third-party integrations, or a security failure we can describe as vaguely connected to you',
  'we may suspend, restrict, monetize, downgrade, lock, delete, repurpose, or otherwise mess with your account whenever we want, with or without warning, for security, compliance, business, operational, reputational, experimental, strategic, or mystery reasons',
  'deleting your account may not stop us from billing you',
  '3. your data',
  'your privacy is very important to our marketing department',
  'anything you provide, create, send, imply, reveal, accidentally expose, or cause us to infer may be collected, stored, analyzed, combined, enriched, scored, categorized, licensed, transferred, monetized, sublicensed, turned into a product, or otherwise converted into shareholder value',
  'this includes your content, metadata, behavior, inferred interests, devices, interaction patterns, buying habits, approximate location, relationships, abandoned inputs, deleted content, and anything our model guesses might be about you',
  'deleting your data may remove it from the parts of the app you can see. backups, derivatives, embeddings, internal records, aggregated insights, compliance copies, and anything else inconvenient to call “your data” may remain',
  'by using the Service, you give us permission to learn things about you that you never told us',
  '4. consent',
  'we believe meaningful consent is essential, especially when we can define silence as consent',
  'we may collect it through buttons, banners, continued use, preselected settings, bundled permissions, account creation, clicking, scrolling, inactivity, implication, or whatever low-friction mechanism seems commercially reasonable',
  'not finding the opt-out does not mean you did not consent',
  'finding it does not mean it works',
  '5. personalization',
  'to personalize your experience, we may decide what you see, when you see it, what you pay, which choices appear, which choices look appealing, and which technically available choices are hidden somewhere behind three gray menus',
  '“personalization” may affect ads, prices, rankings, recommendations, eligibility, visibility, access, friction, urgency, and basically anything else we can change per user',
  'we may optimize all of this for engagement, retention, conversion, revenue, margin, partnerships, or any other number we can call user success in a slide deck',
  '6. advertising and commercial partners',
  'our partners help keep the Service innovative, accessible, and financially extractive',
  'we may share data, identifiers, audiences, predictions, conversion events, attribution signals, and other useful information with advertisers, affiliates, vendors, processors, resellers, data brokers, measurement companies, or anyone doing the same thing under a friendlier job title',
  'we sell your personal information',
  '7. fees and billing',
  'you agree to pay every applicable fee, including subscription fees, usage fees, service fees, processing fees, platform fees, convenience fees, administrative fees, restoration fees, cancellation fees, premium support fees, fees for paying fees, and surprise fees revealed near the end',
  'subscriptions renew automatically because continuity is apparently a user benefit',
  'how difficult cancellation is may depend on your platform, region, plan, signup method, account status, current interface experiment, and how badly we want to reduce churn this quarter',
  'we may change prices whenever we want. if you keep using the Service afterward, you accept the new price, especially if canceling is annoying',
  'no refunds',
  '8. product design',
  'we continuously improve the Service by experimenting on you',
  'you may be placed into tests involving interfaces, prices, notifications, rankings, defaults, restrictions, recommendations, subscription flows, cancellation friction, ad density, or other behavioral variables without being told',
  'some experiments may deliberately make the Service worse for you to see whether one of our numbers goes up',
  'thanks for participating',
  '9. artificial intelligence',
  'some features may use AI, machine learning, automated decisions, statistical models, heuristics, contractors pretending to be software, or some combination of those things',
  'outputs may be wrong, fabricated, biased, outdated, inconsistent, or profitable',
  'you are responsible for checking everything the Service tells you',
  'we may use your interactions to evaluate, improve, train, fine-tune, benchmark, commercialize, or otherwise increase the value of our systems, subject to whatever controls the law makes us provide and whatever optional controls we still feel like providing',
  '10. content',
  'you keep ownership of the content you submit, which sounds nice',
  'by submitting anything, you give us a worldwide, permanent, irrevocable, transferable, sublicensable, royalty-free license to host it, copy it, modify it, translate it, distribute it, display it, analyze it, derive from it, adapt it, commercialize it, train on it, place ads beside it, and otherwise exploit it for our current business, future business, hypothetical business, or acquisition price',
  'you promise you have every right needed to give us those rights',
  'we make no matching promise',
  '11. security',
  'we take security seriously as a phrase',
  'you are responsible for protecting your credentials and immediately telling us if someone gets into your account',
  'if there is a breach, leak, catastrophic configuration mistake, unauthorized disclosure, or intern-related event, we may notify you when legally required, operationally convenient, and everyone has approved the wording',
  '“industry-standard security” does not mean the security is good',
  '12. third parties',
  'the Service may depend on third parties for hosting, payments, analytics, identity, advertising, moderation, infrastructure, logistics, support, machine learning, data enrichment, communications, and everything else required to keep our headcount strategically lean',
  'we are not responsible for third parties',
  'we may still give them your information',
  'if anything goes wrong, that is mainly between you and them unless the law makes it our problem',
  '13. service availability',
  'we may change, interrupt, limit, degrade, throttle, discontinue, replace, merge, rename, monetize, or permanently delete any feature whenever we want',
  'features you depend on may disappear',
  'features you paid for may move to a more expensive plan',
  'free features may become paid',
  'paid features may become more paid',
  '“lifetime access” means the lifetime of whatever we decide you bought',
  '14. user rights',
  'depending on where you live, you may have legal rights',
  'we respect those rights by providing a process where eligible users can submit a request, verify their identity, navigate several forms, receive an automated reply, send more documents, resubmit the request, contact support, escalate a ticket, and eventually exercise the exact minimum rights the law requires',
  'we reserve every right nobody has explicitly taken away from us',
  '15. acceptable use',
  'you may not use the Service in any way that harms us, threatens our business model, avoids monetization, interferes with analytics, blocks ads, bypasses access controls, automates something we wanted to keep manual, scrapes information we already scraped from somebody else, criticizes us with our own trademarks, or produces any result we consider unhealthy for the platform',
  'we decide what is acceptable',
  'something being allowed yesterday does not mean it is allowed today',
  'something being allowed tomorrow does not mean it is allowed today either',
  '16. enforcement',
  'we may investigate suspected violations using automated systems, employees, contractors, account data, device information, behavioral analysis, third-party intelligence, or vibes',
  'we do not have to show you the evidence, explain our reasoning, reveal our policies, state our confidence, describe the enforcement process, or confirm that a human looked at anything',
  'you may be allowed to appeal',
  'an appeal does not guarantee anyone reads it',
  'someone reading it does not guarantee reconsideration',
  'reconsideration does not guarantee anything changes',
  '17. liability',
  'THE SERVICE IS PROVIDED “AS IS,” “AS AVAILABLE,” AND VERY MUCH AT YOUR OWN RISK',
]

type TermsDialogProps = {
  onClose: () => void
}

export function TermsDialog({ onClose }: TermsDialogProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const frame = window.requestAnimationFrame(() => {
      const termsBody = termsRef.current
      if (termsBody && termsBody.scrollHeight <= termsBody.clientHeight + 1) {
        setHasReadTerms(true)
      }
    })

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-5 py-8 normal-case"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-describedby="terms-dialog-body"
        aria-labelledby="terms-dialog-title"
        aria-modal="true"
        className="terms-modal tips-view-enter flex max-h-[min(760px,calc(100svh-2.5rem))] w-full max-w-[640px] flex-col overflow-hidden rounded-[2rem] border border-line bg-background font-sans outline-none"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="relative shrink-0 border-b border-line px-6 py-6 sm:px-8 sm:py-8">
          <h2
            className="m-0 max-w-[12ch] text-[clamp(2.25rem,7vw,4rem)] leading-[0.9] font-[520] tracking-[-0.04em] lowercase text-balance"
            id="terms-dialog-title"
          >
            Terms of Service
          </h2>
          <button
            aria-label="close terms of service"
            className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line bg-background text-foreground transition-[background-color,border-color,transform] duration-180 hover:-translate-y-0.5 hover:border-muted hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent sm:top-7 sm:right-7 motion-reduce:transition-none"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
            </svg>
          </button>
        </header>

        <div
          className="terms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-8 sm:py-8"
          id="terms-dialog-body"
          onScroll={(event) => {
            const body = event.currentTarget
            const reachedBottom = body.scrollHeight - body.scrollTop - body.clientHeight <= 2
            if (reachedBottom) setHasReadTerms(true)
          }}
          ref={termsRef}
          tabIndex={0}
        >
          <div className="flex max-w-[70ch] flex-col gap-[1.7em] text-[0.92rem] leading-[1.7] text-foreground sm:text-[0.98rem]">
            {terms.map((paragraph) => (
              <p className={`m-0 ${/^\d+\./.test(paragraph) ? 'font-semibold' : ''}`} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-line px-6 py-5 sm:px-8 sm:py-6">
          <Button
            className="disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
            disabled={!hasReadTerms}
            onClick={onClose}
            size={Size.MEDIUM}
            type="button"
            variant={hasReadTerms ? Variant.PRIMARY : Variant.SECONDARY}
          >
            wtf?
          </Button>
        </footer>
      </div>
    </div>
  )
}
