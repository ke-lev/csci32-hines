# commits and pull requests

use Conventional Commits for every commit message, PR title, and squash or merge commit title: `<type>(<optional-scope>): <description>`, for example `feat(database): add roles and permissions`.

- choose the type that matches the change, such as `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, or `chore`
- keep descriptions concise and imperative; use lowercase except for technical names and identifiers
- mark breaking changes with `!` before the colon and explain them in a `BREAKING CHANGE:` footer
- use branch names like `feat/roles-and-permissions` or `docs/commit-conventions`; this is the repo's branch naming convention, since Conventional Commits does not define branch names
- write PR bodies in plain prose describing the change and its verification; the title carries the Conventional Commits format

# lab issue logs

when the user shares a `docs.superhuman.com` course lab, create or continue a matching issue log in `labissues/` while working through the lab

## working through a lab

work the lab one section at a time. never run the whole lab in a single pass, even when every step is already known

for each section:

1. restate the lab's instruction for that section and what it will change in this repo
2. wait for the user to say go before touching files
3. apply the smallest change that satisfies the lab, adapted to this repo's existing setup rather than blindly copypasted
4. run whatever verifies it (`yarn dev`, `yarn check-types`, `yarn lint`, `yarn build`, hitting the endpoint) and report the real result
5. if something failed in a way a student following the lab would also hit, append it to the lab's log in `labissues/` before moving on
6. stop and hand control back

before starting a lab, read it end to end and flag anything that is obviously going to break against the current repo. flag it as a heads-up only. do not write it into the log until it has actually been hit and confirmed

## filenames

name each file `<week>-<lab-number>-<lesson-subject>.md`, such as `2-2-tailwind-buttons.md`

- keep the subject lowercase and kebab-cased
- use the week and lab number supplied by the user when available. otherwise derive them from the semester map described below
- the second number is the lab's order within that week, not the lesson number in the course map
- find and select logs primarily by the lesson-subject portion of the filename
- continue an existing matching subject log instead of creating duplicates

## semester map

the canonical local course map is `/Users/ke.lev/Library/Mobile Documents/iCloud~md~obsidian/Documents/kelev/csci32-clone`

when numbering a lab issue file:

1. find the matching lesson by its subject in the appropriate `week<number>/` directory
2. get the week number from that directory name
3. sort that week's numbered lesson files by their numeric prefix
4. count only filenames containing `-lab-`. the matching lab's one-based position in that filtered list is its lab number

for example, `week2/02-lab-turborepo.md` maps to `2-1-turborepo.md`, while `week2/03-lab-tailwind-typescript-button.md` maps to `2-2-tailwind-buttons.md`

the lesson-subject portion may be shortened when the result is still unambiguous. do not copy the source lesson number into the lab-number position

## what belongs in the log

only record serious, reproducible problems that a student would encounter by following the lab directions from the intended starting project

good candidates include commands that fail, incompatible tool requirements, instructions that overwrite necessary current configuration, missing dependencies or build steps, and directions that produce a broken or ungradable result

do not record harmless version differences, stylistic preferences, minor inefficiencies, optional improvements, or theoretical concerns with no meaningful effect on completing the lab

verify an issue when practical before adding it. add issues as they are encountered instead of pre-filling the file with speculation

## writing format

match the casual, direct style used in `labissues/2-1-turborepo.md`. keep headings and prose mostly lowercase while preserving the correct capitalization of technical names and identifiers

use this structure for every issue:

```md
## short description of the failure

compatibility: what the lab tells the student to do and the concrete failure it causes

workaround: the smallest reliable change that lets the student complete the lab
```

include exact commands, filenames, versions, and error names when they are relevant. keep the explanation focused on the real effect

## package manager

this repo pins yarn 1.22.22 through `devEngines`, so every `npm` and `npx` command in a lab exits with `EBADDEVENGINES` before it runs. silently substitute the yarn equivalent (`yarn init -y`, `yarn tsc --init`, `yarn prisma studio`, and so on) and carry on

this is a known standing difference. do not log it as a lab issue and do not call it out in conversation
