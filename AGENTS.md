# lab issue logs

when the user shares a `docs.superhuman.com` course lab, create or continue a matching issue log in `labissues/` while working through the lab

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
