---
title: help
route: help
summary: these pages — one doc per feature, kept honest by a failing test
---

## what it does

the documentation you are reading. every page on the site has a doc here
explaining what it does and how to use it.

these are not maintained by good intentions. a test walks the site's route
registry and fails the build if any route has no doc, so a new page cannot ship
undocumented.

## how to use

1. pick a feature from the list on the left
2. read what it does, then follow the numbered steps
3. a `new` tag means a changelog entry touched that feature in the last 30 days;
   it disappears on its own
4. to add a doc, drop a markdown file in `app/help/docs/` with a title, route, and
   summary
