---
title: admin console
route: admin
admin: true
summary: the role-gated console behind the users shell
---

## what it does

the payoff for poking at the users shell. a conventional admin console holding
the controls the public pages do not expose.

it is gated on the admin role, not on where you are browsing from: the page
checks the signed-in session and denies anyone without the role.

five tabs: routes and posts report what the site actually serves, users lists and
searches accounts, tips collects ideas submitted through the sitewide tips menu,
and talk holds the room. when email notifications are configured, each new tip
also sends the administrator a link back to this inbox.

## how to use

1. only way to get here is to login with admin credentials
2. read routes and posts for the true inventory, including the unlisted and root
   paths
3. search and sort accounts from the users tab
4. work the tip inbox: close what is handled, filter between open and closed
5. reopen anything closed by mistake — closing is not permanent
6. soft-delete room lines that should not stay up
7. to end the session, return to `/users` and type: `logout`
8. this doc is unlisted on purpose; it is not in the public help index
