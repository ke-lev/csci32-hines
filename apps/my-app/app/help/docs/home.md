---
title: home
route: home
summary: the front door — three ways in, the thursday control, and whatever is playing
---

## what it does

the landing page. the intro carries a link to the timeline and the thursday
control, a compact spotify card shows what is playing (or the last thing that
did), and the panel on the right holds three ways in: buttons, input, and games.

it is not the full route index. those three are the front door; the users shell
knows the whole route table.

the chrome around it is on every page: the theme toggle and the tips button up
top, and an info button in the footer that opens the doc for whatever page you
are on.

## how to use

1. nav

- filepath breadcrumbs: show cwd on the site tree
  - `users/` links to a users terminal
- dark/light/system theme icon: changes theme
- tips: shows the tips modal, where you can send ideas to admin, or send money to me

2. left side intro

- timeline: links to `/timeline` - semester devlog
- thursday: checks if it's thursday
- spotify: shows recently played

3. right side card

- `/buttons` links to button lab (some fun buttons)
- `/input` links to input lab (a lot going on there)
- `/games` links to games lab (not much there)

4. footer

- info `i`: opens this page's doc in a modal, from any page that has one
- github: links out to the source
