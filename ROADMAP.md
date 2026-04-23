# Roadmap

The CreatorOS roadmap is anchored to one problem: creators lose ideas and struggle to stay consistent. Every planned item sits directly on that problem. Features that don't are listed under "Later considerations" so the scope stays honest.

For the full product thinking behind these decisions, see the [PRD](./docs/CreatorOS_PRD.pdf).

## Now — dogfooding and preparing to validate v1

I'm currently using CreatorOS as my primary content planning tool. No new features ship until v1's assumptions are pressure-tested against real users — I'd rather scope v2 against actual friction than against my own guesses.

- Dogfooding v1 as the primary user
- Planning to run user interviews with other creators to validate core assumptions
- Capturing dogfooding notes in [LEARNINGS.md](./LEARNINGS.md)

## Next — v2: solving what v1 couldn't

v1 proved the pipeline concept. v2 addresses the three biggest friction points surfaced in dogfooding so far, all of which sit directly on the core problem.

- **Mobile idea capture** — v1 is desktop-first, but the majority of idea moments happen on a phone. If ideas can't be captured where they happen, the pipeline starts empty.
- **AI script generation** — removes the blank-page friction at the Idea → Scripted transition, which is where cards currently stall the longest.
- **AI shot list generation** — completes the idea-to-ready-to-film flow without manual shot planning, which most users skip entirely today.

## Later considerations — not next

These features become interesting only after v1's core loop is proven and users are consistently shipping content. Listed for transparency, not planned for the next release.

- **TikTok auto-publishing via official API** — solves the posting step, which is downstream of the core pain.
- **Multi-platform expansion (Instagram Reels, YouTube Shorts)** — a distribution concern, not an idea-capture one.
- **Performance analytics integration** — an optimization feature for creators who are already shipping consistently, which the v1 user is not yet.
- **Collaboration for creators with editors or managers** — serves a different user (creators with teams) and is likely a different product entirely.

## Cut from v1 — and why

Documenting scope decisions from the original PRD. See the PRD for full reasoning.

- **Automatic TikTok page scraping for creator style analysis** — dropped due to TikTok ToS and API limitations. Replaced with a user-driven style inspiration board.
- **Hook generator as a standalone feature** — absorbed into the AI creative assistant as a prompt type rather than its own feature.

---

*This roadmap updates as dogfooding and user interviews surface new information. Last meaningful update: April 2026.*
