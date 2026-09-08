# ideas

## chatroom feature

### some ideas from codex

1. ~~**Prevent skipped messages.**~~ done - the poll cursor is its own ref in `use-room.ts`; posting
   no longer advances it, so a line someone else sent mid-poll is still picked up.

2. ~~**Make moderation reach open rooms.**~~ done - every sixth poll re-reads the newest page and
   drops loaded lines the server no longer returns, so a deleted line leaves an open room inside 30s.

3. ~~**Protect the composer.**~~ done - Enter is guarded by the same condition as the send button, and
   a successful send only clears the text it actually sent.

### other potential improvements

- ~~**A small `↓ 3 new lines` control**~~ done - appears only when you have scrolled up, plus scroll
  preservation on `load older` and a reliable landing on the newest line.
- ~~**Date separators**~~ done - `today` / `yesterday` / `september 8`, hairline on both sides.
- ~~**Useful connection feedback**~~ done - `connecting...`, a retry line with a retry control, and the
  server's own refusal text (the rate limit countdown) instead of `could not send that`.
- ~~**An actionable sign-in prompt**~~ done - the prompt links to `/users/?next=<current path>` and auth
  honors in-app `next` paths; `posting publicly as <handle>` sits under the composer.
- ~~**Better profile states.**~~ done - the panel opens on the click with a loading line, an empty
  profile reads differently from a failed request, and a stale reply cannot overwrite the last handle
  clicked.
- ~~**Readable moderation history.**~~ done - the admin panel wraps full bodies and pages older lines.

**still open:** none of the above. worth considering next - a real subscription transport (the poll is
fine at this size but the reconcile pass is a workaround), and rate-limit feedback before you hit it.

## ui ideas

### "i" information popup

circle i info button on footer - when clicked, shows technical info about the page. this would allow to move technical explanations (/input is a good example) from the pageintro copy into a secondary spot
