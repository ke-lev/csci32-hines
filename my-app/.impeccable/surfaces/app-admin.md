---
version: 1
slug: "app-admin"
primary_target: "app/admin"
related_targets: ["app/admin/page.tsx","app/admin/admin-console.tsx"]
---

# Admin surface

- Scope and mode: `/admin` is an Operate-mode, conventional admin console inside the established Midnight Workbench system.
- Audience and job: a programmer who elevated through `/users` arrives expecting a recognizable control plane, scans site state, opens routes, and experiments with clearly local-only settings.
- Chosen direction: the shared two-column shell pairs an oversized `admin` introduction with a dense full-bleed control panel. A compact session bar, four overview cells, a route table, and access-control rows supply familiar admin-console topology without nested cards.
- Memorable moment: `sudo admin` in the iTerm surface mounts and opens `/admin`; direct navigation without the session receives a useful 403 and a route back to the terminal.
- Truth and boundaries: authorization is theatrical and stored only in session storage. Metrics describe static project facts or the local tab. Settings are labeled as a local simulation and must not imply server changes, private visitor data, or a real security boundary. The route stays off homepage navigation.
- States: checking privilege, denied, granted, toggles on/off, route navigation, and ending the session. Preserve responsive stacking, keyboard focus, reduced-motion behavior, and the existing rare-signal rule.

## Direction contract

- THESIS: The hidden terminal resolves into the admin console it promised; the page uses familiar operational structure without becoming a generic pile of floating cards.
- OWN-WORLD: Midnight Workbench ink, warm paper, hairlines, flat rows, Geist display type, Geist Mono system data, and soft sky blue only for live root state and keyboard focus.
- STORY: Elevate in `/users`, enter a recognizable root control plane, inspect truthful site state, try local controls, then open a route or end the session.
- FIRST VIEWPORT: Oversized `admin` introduction at left; at right, one full-height panel begins with a root session bar, four compact metrics, and the route table, with settings continuing in the panel scroll.
- FORM: User-pinned traditional admin console extending the selected sudo flow from surface seed `87d6a472`.
- FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
