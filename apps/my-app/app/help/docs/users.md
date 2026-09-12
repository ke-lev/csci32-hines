---
title: users shell
route: users
summary: a zsh-style guest session that navigates the site, plays snake, and signs you in
---

## what it does

a working shell as an easter egg. it navigates the real site, knows the real
route table, reads timeline posts, and keeps local stats about your session.

it is where you sign in and out, and it is the way in to the admin console for
accounts that hold the admin role.

## how to use

1. run `help` to list every command the session accepts
2. use `ls` and `tree` to see the site as a directory, then `open <route>` to go
   there
3. `login` or `signup` to authenticate, `logout` to sign out, `whoami` to see
   what you are holding
4. `cat timeline/9-7` reads a post without leaving the shell; `cat README.md`
   works too
5. `talk` prints the latest room lines, `ideas` lists submitted tips (both need
   an account)
6. `snake` starts a game in the log — arrows or wasd to move, q to quit
7. ↑ and ↓ walk history, `history` prints it, ctrl+space completes, ctrl+l
   clears, ctrl+c exits
8. `admin` opens the console if your account has the role, and says so plainly if
   it does not
