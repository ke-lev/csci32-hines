# commits and pull requests

use Conventional Commits for every commit message, PR title, and squash or merge commit title: `<type>(<optional-scope>): <description>`, for example `feat(database): add roles and permissions`.

- choose the type that matches the change, such as `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, or `chore`
- keep descriptions concise and imperative; use lowercase except for technical names and identifiers
- mark breaking changes with `!` before the colon and explain them in a `BREAKING CHANGE:` footer
- use branch names like `feat/roles-and-permissions` or `docs/commit-conventions`; this is the repo's branch naming convention, since Conventional Commits does not define branch names
- write PR bodies in plain prose describing the change and its verification; the title carries the Conventional Commits format

# subagents

use subagents when a task is precise, bounded, and mostly simple code or verification work. use the
least expensive capable model. Codex should prefer Luna with max reasoning.

the parent agent owns integration, review, and final verification. when awaiting the result of a subagent, do not wake to check if they've completed every x seconds! just wait for them to finish.

keep ambiguous, architectural, high-risk, and user-facing decisions with the parent unless the user explicitly delegates them.

# todo.md

`todo.md` at the repo root is the only backlog. there is no `ideas.md`, no `review.md`, and no
per-topic todo file. reviews, audits, bug sweeps, and idea dumps all append here.

it has exactly two sections, split by the kind of answer the item needs:

- `## calls` needs a decision from the user. one bold headline plus at most one line of context. no
  file paths, no rationale paragraphs, no tradeoff lists. if it needs those to be understood, it is
  not a call
- `## work` needs code. write it so an agent with no context can start without asking anything: the
  files involved, the mechanism, how to verify it. long is correct here

verbosity is earned by a yes. an idea stays one line until the user approves it; approval is what
buys it a technical writeup.

## the sweep

before adding anything to `todo.md`, act on every `>` verdict already in it:

- `> no`, or any other refusal, including a soft one like `not now` - delete the item
- `> yes` on a call - rewrite it as a `## work` item with real detail, then drop the `>` line
- a note, correction, or redirect - fold it into the item's own text, then drop the `>` line
- anything ambiguous - leave the item exactly as it is and raise it in conversation

never write a `>` line. those are the user's.

## done means deleted

delete finished items. no strikethroughs, no `## done` section, no "shipped" notes. git history and
the timeline posts in `apps/my-app/app/timeline/posts/` are the record of what happened.

when something claims to be already fixed, verify it against the code before recording it either
way. do not carry a stale finding forward on the strength of a review that asserted it.
