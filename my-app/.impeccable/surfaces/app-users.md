---
version: 1
slug: "app-users"
primary_target: "app/users"
related_targets: ["app/users/page.tsx","app/users/users-terminal.tsx"]
---

# Users surface

- Scope and mode: `/users` is an Operate-mode easter egg inside the established Midnight Workbench visual system.
- Audience and job: a programmer visiting kelev's course site discovers a believable guest zsh session, recognizes the joke, and explores real project structure without needing instructions outside the terminal.
- Chosen direction: a full-bleed iTerm-style window with macOS traffic-light chrome contains a guest shell that hints the visitor should identify as `admin`, replies “you forgot sudo,” then accepts `sudo admin` to enter a theatrical privileged view. The memorable moment is the shell mounting and launching the admin console.
- Content and behavior: the live prompt and its accessible input sit directly after the scrollback like a real terminal line; there is no separate input tray or run button. Support discoverable commands for identity, help, directory structure, safe project navigation, truthful client/session stats, a professor note, logout, history navigation, and clearing the terminal. Any analytics shown must be local or explicitly labeled; there is no real authentication or security boundary.
- Boundaries: preserve `PageShell`, the site's palette, typography, responsive collapse, keyboard focus treatment, and lowercase voice. Keep `/users` out of the homepage route panel; discovery happens through the leading `users` breadcrumb. Do not imply access to private visitor data, create a generic metric dashboard, or make the fake privilege state security-sensitive.

## Direction contract

- THESIS: A believable guest zsh session turns page discovery into an unlockable developer easter egg; it refuses the standard admin-dashboard grid.
- OWN-WORLD: The established Midnight Workbench—near-black ground, warm off-white type, a single flat rounded terminal, hairline rules, Geist Mono system language, and soft sky blue reserved for live privilege state.
- STORY: A programmer notices the sudo hint, inspects permissions, elevates into a clearly theatrical root session, then explores honest project structure and local session data.
- FIRST VIEWPORT: The shared shell holds an oversized `users` introduction at left and one full-height, full-bleed iTerm window at right; its inline command prompt is the primary action, and elevation changes intro copy, prompt, and the terminal session title.
- FORM: User-pinned sudo-plus-filesystem hybrid selected during surface concept roll `87d6a472`.
- FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
