---
title: help docs and this changelog
kind: feature
features: help, changelog
---

every page on the site now has a help doc explaining what it does and how to use
it, and this changelog records what changes.

both are enforced rather than remembered: a test fails the build if any route in
the site registry has no doc, and ci rejects a pull request that touches
user-facing code without adding an entry here.
