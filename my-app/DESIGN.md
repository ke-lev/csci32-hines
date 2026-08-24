---
name: "git'n init"
description: "A minimal midnight workspace for small experiments, course work, and an honest devlog."
colors:
  ink: "#050505"
  paper: "#f4f4ef"
  muted-copy: "#92928b"
  hairline: "#292927"
  acid-signal: "#cbff4a"
  supporting-copy: "#aaa9a3"
  footer-copy: "#64645f"
  row-hover: "#0d0d0c"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(4.1rem, 8.7vw, 9rem)"
    fontWeight: 520
    lineHeight: 0.84
    letterSpacing: "-0.078em"
  title:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.68rem"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "0.04em"
  status:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.64rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.11em"
  compact-copy:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  xs: "0.125rem"
  code: "0.35rem"
  artwork: "0.5rem"
  panel: "2rem"
  pill: "9999px"
spacing:
  hairline: "1px"
  compact: "8px"
  control-x: "15px"
  row-gap: "16px"
  panel-inset: "clamp(12px, 1.4vw, 20px)"
  row-x: "clamp(18px, 2vw, 28px)"
components:
  pill-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
  pill-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
  right-panel:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    width: "min(100%, 620px)"
  spotify-artwork:
    backgroundColor: "{colors.row-hover}"
    rounded: "{rounded.artwork}"
    size: "64px"
  spotify-card:
    backgroundColor: "{colors.ink}"
    padding: "12px"
    height: "96px"
    width: "304px"
    rounded: "{rounded.panel}"
---

# Design System: git'n init

## Overview

**Creative North Star: "The Midnight Workbench"**

The interface feels like a personal terminal made welcoming: near-black space, warm off-white type, precise hairlines, and a casual lowercase voice. Large, tightly tracked display type establishes personality while compact monospace metadata gives paths, controls, and live status a functional rhythm.

The system stays sparse and flat. Personality comes from scale contrast, tiny positional shifts, tactile hover movement, and rare acid-green signals—not decorative layers. Dense utility belongs inside the rounded right-hand panel; the surrounding canvas stays spacious enough for the work to breathe.

**Key Characteristics:**

- Near-black and warm off-white foundation with restrained gray hierarchy.
- Oversized Geist headlines paired with compact Geist Mono metadata.
- Thin borders, pill controls, and one large rounded utility panel.
- Casual lowercase copy with direct, state-aware language.
- Acid green reserved for keyboard focus, active playback, and tiny system signals.

## Colors

The palette is intentionally narrow: warm monochrome carries the interface, while acid green appears only when the system needs to signal life or focus.

### Primary

- **Acid Signal:** The sole chromatic accent. Use it for keyboard focus outlines, active equalizer bars, selection, and tiny live-status indicators.

### Neutral

- **Workbench Ink:** The page and panel ground; it keeps the experience quiet and high contrast.
- **Warm Paper:** Primary text, selected states, filled controls, and strong timeline marks.
- **Muted Copy:** Secondary descriptions, inactive metadata, and quiet status graphics.
- **Supporting Copy:** Introductory and post-summary text that needs more presence than muted metadata.
- **Footer Copy:** The quietest persistent text role.
- **Hairline:** One-pixel dividers, outlines, and container boundaries.
- **Row Hover:** A subtle interaction and placeholder surface one step above the page ground.

### Named Rules

**The Rare Signal Rule.** Acid green is a state color, not a decorative fill; keep it confined to focus, active playback, selection, and tiny live indicators.

**The Warm Contrast Rule.** Use warm paper rather than pure white for primary foregrounds so the interface remains stark without feeling clinical.

## Typography

**Display Font:** Geist (with Arial and sans-serif fallbacks)

**Body Font:** Geist (with Arial and sans-serif fallbacks)

**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** The pairing is plainspoken but exact. Geist supplies the oversized, slightly compressed personality; Geist Mono turns paths, dates, controls, and live metadata into a compact instrument panel.

### Hierarchy

- **Display** (520, fluid oversized scale, 0.84 line-height): Page-defining headlines only; keep tracking extremely tight and allow controlled line offsets.
- **Headline** (540–600, fluid 2.25–3.8rem, 0.94 line-height): Reading-card and section titles.
- **Title** (600, 0.98rem, tight line-height): Compact item titles such as the current track name.
- **Body** (400, 0.88–1.2rem, 1.55–1.75 line-height): Descriptions and long-form copy; prose lines top out around 60ch.
- **Label** (600–650, 0.64–0.78rem, deliberately tracked): Breadcrumbs, dates, pills, footer metadata, and playback status.

### Named Rules

**The Two-Gear Rule.** Use dramatic sans-serif scale for identity and compact mono for system language; avoid intermediate display treatments that blur those roles.

**The Lowercase Voice Rule.** Interface labels and conversational status copy stay lowercase unless a proper noun or external brand requires otherwise.

## Layout

The shared shell uses a two-column composition with the expressive page introduction on the left and a bounded utility panel on the right. The columns are separated by a fluid 40–80px gap; the content field receives generous fluid vertical space and the page frame uses 32px horizontal and 28px vertical padding. On the homepage, the left wrapper and right route panel share the shell's fluid panel-height token. The Spotify card uses automatic top margin inside that full-height wrapper so its bottom edge aligns exactly with the panel while its 304px width stays anchored to the intro's leading edge.

At 900px and below, the shell becomes one column, the homepage's fixed-height left wrapper returns to natural flow, and the Spotify card receives a 32px top margin before the full-width right panel. At 560px and below, outer padding becomes 20px, the display scale and section gaps contract, and the right panel settles at 420px tall. The utility panel is capped at 620px wide and uses a fluid 12–20px inset. On desktop viewports 760px tall or shorter, only the homepage headline and subhead contract so the shared bottom alignment remains intact.

Inside the right panel, exactly three route rows are full-width and divided by one-pixel hairlines. Interactive rows use a consistent fluid horizontal inset and enough vertical space to remain easy to scan and target. The Spotify status is not part of this panel: it is a separate compact card with a 304px-by-96px silhouette, a 2rem radius, 12px inset, 12px content gap, and fixed 64px artwork. Its flexible text column truncates long track and artist names, while the status line stays on one line in every known state.

When the shell collapses to one column, source order remains meaningful: the complete intro, including Spotify status, appears before the right-panel route navigation.

## Elevation & Depth

The system is flat by default and uses no ambient card shadows. Depth comes from borders, tonal shifts, clipped rounded containers, small hover translations, and inset focus outlines. The only glow is a restrained acid-green halo around the tiny footer status dot.

### Shadow Vocabulary

- **Inset Focus:** A two-pixel acid-green inset ring for full-row links where an external outline would be clipped by the panel.
- **Live Halo:** A soft 12px acid-green glow used only on the tiny footer system indicator.

### Named Rules

**The Flat Workbench Rule.** Surfaces stay flat at rest; hierarchy comes from type, space, and hairlines rather than floating cards.

## Shapes

The page combines two geometric registers. The main utility panel and compact Spotify card use a generous 2rem radius, while controls use full pills and small content media uses an 0.5rem radius. Hairline borders provide structure without visual weight. Artwork and its fallback share the exact same 64px rounded silhouette so data states never change the card geometry.

**The Stable Silhouette Rule.** Loading, idle, unavailable, paused, recent, and playing states must preserve the same component dimensions and alignment.

## Components

### Pill Controls

- **Shape:** Full capsule with a one-pixel warm-paper border.
- **Primary:** Warm-paper fill with ink text and compact mono labeling.
- **Secondary:** Ink fill with warm-paper text; used for inactive or alternate actions.
- **Hover / Focus:** Lift by 2px on hover; use an acid-green two-pixel focus outline with visible offset. Remove transform motion when reduced motion is requested.

### Navigation

- **Breadcrumbs:** Path-style mono text with slash separators; hover and focus soften toward muted copy.
- **Site Links:** Compact pill controls. The current route inverts to warm paper, while external and available routes retain explicit interaction feedback.
- **Responsive Treatment:** Header navigation remains compact at all widths; surrounding frame padding contracts rather than replacing the pattern.

### Cards / Containers

- **Corner Style:** One large, clipped 2rem panel; nested rows do not introduce more card shells.
- **Background:** Workbench ink at rest and row-hover neutral on interactive hover/focus.
- **Shadow Strategy:** Flat at rest; see Elevation & Depth for the limited focus and live-status exceptions.
- **Border:** One-pixel hairline around the panel and between rows.
- **Internal Padding:** Fluid 12–20px panel inset; rows provide their own fluid 18–28px horizontal padding.

### Route Rows

Route rows are broad, right-aligned targets. A filled mono pill carries the route name; supporting copy sits beneath it at a readable 42ch maximum. Hover and keyboard focus shift the row surface, and the label nudges 4px left unless reduced motion is requested.

### Spotify Listening Status

The listening status is a compact rounded card beneath the Thursday controls in the homepage intro. It is 304px wide—slightly more than twice the Thursday pill—with a 96px silhouette, 2rem radius, and fixed 64px artwork. On desktop its bottom edge shares the right route panel's datum through the shell's panel-height token; below 900px it returns to natural flow. A flexible, truncating text stack sits between the artwork and 20px Spotify mark. Status metadata is small, tracked Geist Mono with compact tracking that keeps every known state on one line; the track title is stronger Geist sans; the artist returns to muted body text. Below 760px viewport height, the homepage headline and subhead contract so the shared bottom datum remains intact without overlap.

- **Loading:** Use fallback artwork with “checking the speakers,” “quiet hours,” and “check back in a bit.”
- **Idle:** Preserve the fallback artwork and geometry with “nothing spinning right now.”
- **Unavailable:** Fail quietly in place with “spotify is offline.”
- **Paused:** Show real track data and muted, still equalizer bars with “paused on.”
- **Recent:** When nothing is actively playing, show the latest track with muted, still equalizer bars and “recently played.”
- **Playing:** Show real track data and staggered pulsing acid-green equalizer bars with “currently listening to.”
- **Interaction:** Any state with real track data—recent, paused, or playing—becomes a link. Open the supplied Spotify URL in a new tab, expose the full action in the accessible name, use the shared tonal hover and inset acid focus ring, and keep non-track states non-interactive.
- **Accessibility and resilience:** Keep one persistent polite, atomic live region around every state so updates are announced without remounting the status container; retain visible text alongside animation; stop animation when reduced motion is requested; refresh only while the document is visible.

## Do's and Don'ts

### Do:

- **Do** preserve the two-column shell, its responsive one-column collapse, and its generous negative space.
- **Do** use one-pixel hairlines and tonal row shifts to organize dense panel content.
- **Do** keep Spotify beneath the Thursday controls, bottom-aligned with the route panel on desktop, and before route navigation in mobile source order.
- **Do** keep live and fallback Spotify artwork at the same 64px size and radius.
- **Do** make complete interactive rows keyboard-visible with the acid-green inset focus treatment.
- **Do** keep state copy casual, lowercase, and specific about what is happening.

### Don't:

- **Don't** use acid green as a large background, decorative gradient, or routine text color.
- **Don't** add ambient card shadows or stack rounded cards inside the main rounded panel.
- **Don't** make idle, unavailable, or loading Spotify states look clickable.
- **Don't** let long track metadata widen the row; truncate it within the flexible text column.
- **Don't** communicate playback solely through motion or color.
