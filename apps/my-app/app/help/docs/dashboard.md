---
title: dashboard
route: dashboard
summary: your account landing page and the intro everyone else can read
---

## what it does

where you end up after signing in. it restores your session locally, so a refresh
keeps you where you were, and it sends signed-out visitors to the welcome page.

you write an intro in three fields — title, subhead, and body — and the page
previews it as you type. the subhead and body are public: when someone opens your
handle in the room, that is what they read.

## how to use

1. sign in — signed-out visits redirect to welcome
2. edit the three intro fields and watch the preview update
3. save; the intro survives a refresh, and an unsaved draft stays put if a save
   fails
4. stay inside the length each field allows, because the server enforces the same
   bounds and will refuse anything longer
5. restore defaults if you want the generated intro back
6. check it from the room by opening your own handle
