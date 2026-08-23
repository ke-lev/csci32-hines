# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the current project and brief: visitors exploring kelev's personal developer site and experiments.

## Product Purpose

A personal web space for small experiments and pages.

## Operating Context

The site currently presents a single homepage. Path-style breadcrumbs provide navigation context if more pages are added later.

## Capabilities and Constraints

- Built with the existing Next.js App Router project.
- Preserve the existing homepage unless a request explicitly changes it.
- New routes should remain responsive and keyboard accessible.
- Do not fabricate destinations for links that have not been assigned yet.

## Brand Commitments

- Casual, lowercase voice.
- Minimal black interface with off-white text, thin borders, Geist typography, and pill-shaped controls.
- Path-style page headers beginning with `Users/kelev/`.

## Evidence on Hand

- Existing implementation in `app/page.tsx` and `app/globals.css`.

## Product Principles

- Keep navigation simple as routes grow.
- Make interactive states visible and tactile.
- Prefer direct, functional copy over invented product claims.
