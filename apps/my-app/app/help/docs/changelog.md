---
title: changelog
route: changelog
summary: what actually shipped, newest first
---

## what it does

a dated record of changes users would notice: new features, improvements, and
fixes. internal refactoring, dependency bumps, and infrastructure work are
deliberately absent.

this is not the timeline. the timeline is the semester devlog and reads like a
journal; the changelog only records things that changed for whoever is using the
site.

## how to use

1. read from the top — newest entries come first
2. each entry carries its eastern date and time plus a tag: feature, improvement,
   or fix
3. follow an entry's feature link to the doc for the thing it changed
4. to add an entry, drop a markdown file in `app/changelog/entries/` named
   `YYYY-MM-DD-slug.md` and give it a UTC `timestamp` in frontmatter whose eastern
   date matches the filename
