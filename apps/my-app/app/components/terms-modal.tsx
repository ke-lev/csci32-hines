'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Size } from '@repo/ui/size'
import { Variant } from '@repo/ui/variant'

const terms = [
  'By accessing, viewing, interacting with, thinking about, benefiting from, or otherwise existing within reasonable proximity of the Service, you agree to these Terms and any additional terms, policies, interpretations, internal guidelines, unpublished standards, future revisions, or retroactive clarifications we may determine are applicable.',
  'If you do not agree, you may discontinue use of the Service. Certain obligations, permissions, waivers, data rights, payment responsibilities, and other strategically important provisions may continue regardless.',
  '1. Our Relationship With You',
  'Our relationship is built on trust, transparency, mutual value creation, and a clear understanding that our interests take priority whenever those principles become inconvenient.',
  'Nothing in these Terms creates a fiduciary duty, duty of loyalty, duty of care, expectation of fairness, reasonable expectation of privacy, or other obligation requiring us to act in your best interest.',
  'We encourage users to make informed decisions. We reserve the right to limit the information available for making those decisions.',
  '2. Your Account',
  'Your account is provided to you as a revocable access privilege.',
  'You are responsible for all activity associated with your account, including activity resulting from compromised credentials, unauthorized access, confusing interface design, unclear defaults, third-party integrations, or security incidents that we determine are sufficiently user-adjacent.',
  'We may - with or without notice or consent - suspend, restrict, monetize, downgrade, lock, delete, repurpose, or otherwise modify your account at any time for security, compliance, business, operational, reputational, experimental, strategic, or unspecified reasons.',
  'Account termination does not necessarily terminate billing.',
  '3. Your Data',
  'Your privacy is important to us as a core brand value.',
  'Accordingly, information you provide, generate, transmit, infer, imply, reveal, accidentally expose, or cause to exist through use of the Service may be collected, retained, analyzed, combined, enriched, modeled, scored, segmented, licensed, transferred, monetized, sublicensed, productized, or otherwise converted into enterprise value.',
  'This may include content, metadata, behavioral signals, inferred interests, device characteristics, interaction patterns, purchasing tendencies, location-derived signals, social relationships, abandoned inputs, deleted content, and information we probabilistically conclude may be about you.',
  'Deletion requests may remove information from selected user-facing surfaces while preserving strategically necessary copies, backups, derivatives, embeddings, aggregated insights, internal records, compliance artifacts, and anything else no longer operationally convenient to associate with the word “your.”',
  'By using the Service, you authorize us to learn things about you that you did not tell us.',
  '4. Consent',
  'We believe meaningful consent is fundamental to a healthy digital ecosystem.',
  'Where consent is required, we may obtain it through buttons, banners, continued use, preselected preferences, bundled permissions, account creation, interface interaction, inactivity, scroll behavior, implied acceptance, or another friction-optimized consent mechanism deemed commercially reasonable.',
  'Your failure to locate an opt-out does not invalidate your consent.',
  'Your successful location of an opt-out does not guarantee that the setting will have any effect.',
  '5. Personalization',
  'To deliver a more relevant and personalized experience, we may use information about you to determine what you see, when you see it, what you pay, what options are presented, which options are emphasized, which options are technically available but visually discouraged, and which choices we believe produce the healthiest ecosystem outcomes.',
  '“Personalization” may include advertising, pricing, ranking, recommendations, eligibility, visibility, access, friction, urgency, and other individualized product experiences.',
  'We may optimize these experiences for engagement, retention, conversion, revenue, margin, strategic partnerships, or other metrics statistically associated with user success.',
  '6. Advertising and Commercial Partners',
  'Our partners help keep the Service innovative, accessible, and financially extractive.',
  'We may share data, insights, identifiers, audiences, predictions, conversion events, attribution signals, or other commercially actionable information with advertisers, affiliates, vendors, processors, resellers, data partners, measurement providers, or entities performing substantially similar functions under more reassuring terminology.',
  'We sell your personal information.',
  '7. Fees and Billing',
  'You agree to pay all applicable charges, including recurring fees, usage fees, service fees, processing fees, platform fees, convenience fees, administrative fees, restoration fees, cancellation fees, premium support fees, fee-related fees, and other amounts disclosed at any stage of the customer journey.',
  'Subscriptions automatically renew because continuity improves the user experience.',
  'Cancellation options may vary by platform, region, subscription type, acquisition channel, interface version, account status, and our current enthusiasm for churn reduction.',
  'We may change pricing at any time. Continued access after a pricing change constitutes acceptance, particularly where cancellation requires effort.',
  'We have a strict no-refund policy.',
  '8. Product Design',
  'We continuously improve the Service through experimentation.',
  'You may be enrolled in tests involving interfaces, pricing, notifications, rankings, defaults, access restrictions, recommendation systems, subscription flows, cancellation friction, advertising density, or other behavioral variables without notice.',
  'Some experiments may intentionally make the Service worse for you in order to determine whether doing so improves a metric for us.',
  'We appreciate your participation.',
  '9. Artificial Intelligence',
  'Certain features may use artificial intelligence, machine learning, automated decision systems, statistical models, heuristics, contractors pretending to be automation, or combinations thereof.',
  'Outputs may be inaccurate, discriminatory, fabricated, outdated, inconsistent, or economically beneficial.',
  'You remain solely responsible for verifying anything the Service tells you.',
  'We may use your interactions to evaluate, improve, train, fine-tune, benchmark, commercialize, or otherwise increase the value of automated systems, subject to any controls we are required to provide and any controls we voluntarily provide until further notice.',
  '10. Content',
  'You retain ownership of content you submit, which sounds important.',
  'By submitting content, you grant us a worldwide, perpetual, irrevocable, transferable, sublicensable, royalty-free license to host, copy, reproduce, modify, translate, distribute, display, analyze, derive from, adapt, commercialize, train on, advertise alongside, and otherwise exploit that content for any purpose reasonably connected to our business, future business, potential business, hypothetical business, or acquisition value.',
  'You represent that you possess all rights necessary to grant us these rights.',
  'We represent nothing similar.',
  '11. Security',
  'We take security seriously.',
  'You are responsible for maintaining the confidentiality of your credentials and for promptly notifying us of unauthorized activity.',
  'In the event of a security incident, breach, leak, unauthorized disclosure, catastrophic misconfiguration, or intern-related event, we may notify affected users when required by law, when operationally feasible, and after appropriate stakeholder alignment regarding wording.',
  'Our use of the phrase “industry-standard security” should not be interpreted as a warranty that our security is good.',
  '12. Third Parties',
  'The Service may rely on third parties for hosting, payments, analytics, identity, advertising, moderation, infrastructure, logistics, support, machine learning, data enrichment, communications, or whatever else allows us to maintain a strategically lean headcount.',
  'We are not responsible for third parties.',
  'We may nevertheless provide your information to them.',
  'Any resulting issue exists primarily between you and the relevant third party unless applicable law insists otherwise.',
  '13. Service Availability',
  'We may modify, interrupt, limit, degrade, throttle, discontinue, replace, merge, rename, monetize, or permanently remove any feature at any time.',
  'Features you rely upon may disappear.',
  'Features you paid for may move to another plan.',
  'Free features may become paid.',
  'Paid features may become more paid.',
  'Lifetime access means the lifetime of whatever we decide you purchased.',
  '14. User Rights',
  'Depending on where you live, you may possess certain legal rights.',
  'We respect these rights and have established processes through which eligible users may submit requests, verify identity, navigate required forms, receive automated responses, provide additional documentation, resubmit incomplete requests, contact support, escalate tickets, and eventually exercise those rights to the extent required by applicable law.',
  'We reserve all rights not explicitly denied to us.',
  '15. Acceptable Use',
  'You may not use the Service in any manner that harms us, threatens our business model, circumvents monetization, interferes with analytics, blocks advertisements, bypasses access controls, automates interactions we would prefer remain manual, scrapes information we already scraped from somewhere else, criticizes the Service using our trademarks in a confusing manner, or otherwise produces an outcome we determine is inconsistent with platform health.',
  'Whether conduct is acceptable is determined by us.',
  'Past acceptance does not imply future acceptance.',
  'Future acceptance does not imply present acceptance.',
  '16. Enforcement',
  'We may investigate suspected violations using automated systems, internal teams, external vendors, account data, device information, behavioral analysis, third-party intelligence, or intuition.',
  'We are not required to disclose our evidence, reasoning, enforcement methodology, confidence level, internal policies, or whether a human actually looked at anything.',
  'Appeals may be available.',
  'Submitting an appeal does not guarantee review.',
  'Review does not guarantee reconsideration.',
  'Reconsideration does not guarantee a different result.',
  '17. Liability',
  'THE SERVICE IS PROVIDED “AS IS,” “AS AVAILABLE,” AND AT YOUR OWN RISK.',
]

export function TermsModal() {
  const [open, setOpen] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const termsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

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
        setOpen(false)
        setHasReadTerms(false)
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
  }, [open])

  function close() {
    setOpen(false)
    setHasReadTerms(false)
  }

  return (
    <>
      <Button
        aria-haspopup="dialog"
        className="text-muted hover:text-foreground focus-visible:text-foreground"
        onClick={() => setOpen(true)}
        size={Size.MEDIUM}
        type="button"
        variant={Variant.TERTIARY}
      >
        terms of service
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-5 py-8 normal-case"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
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
                onClick={close}
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
                onClick={close}
                size={Size.MEDIUM}
                type="button"
                variant={hasReadTerms ? Variant.PRIMARY : Variant.SECONDARY}
              >
                wtf?
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}
