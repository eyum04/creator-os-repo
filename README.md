# CreatorOS

A content planning tool for creators who script their videos and lose ideas in their Notes app. Move ideas through Idea → Scripted → Filmed → Posted, organize by content pillar, and build shot lists inline.

🔗 **Live:** https://creator-os-repo.vercel.app  
📄 **PRD:** [docs/CreatorOS_PRD.pdf](./docs/CreatorOS_PRD.pdf)

## Why I built this

I wanted to create content, but I was making videos when I felt like it, not on any kind of plan. Ideas lived in my head or got dumped into my phone's Notes app where I'd forget about them a week later. Existing tools either weren't built for creators (Notion, Trello) or were too heavy (full production platforms like StudioBinder, designed for film crews, not solo creators).

CreatorOS is the tool I wanted for myself: opinionated about how content moves from idea to posted, lightweight enough to actually use, and built around the idea that creators need a visible pipeline to stay consistent.

## Who it's for

Creators who script their videos and struggle with consistency. Not beginners who just film off the cuff — this is for people who have ideas constantly but lose them before they ever get shot, and who want to feel in step with every stage of their content.

## What's built (v1)

- **Pipeline** — Idea → Scripted → Filmed → Posted kanban so every piece of content has a home and a next step
- **Content Pillars** — every idea tagged to a theme so the feed builds a brand, not a random collection
- **Shot List Builder** — attached to each video card, visible inline when the card expands
- **Content Calendar** — month view color-coded by pillar so gaps are obvious

## Product thinking

I wrote a full PRD before writing any code — target user, MVP scope, monetization, and explicit descope decisions. You can read it here: [CreatorOS PRD](./docs/CreatorOS_PRD.pdf).

Things I deliberately cut from v1:

- **TikTok auto-publishing** — technically feasible but deferred; the user I'm building for hasn't built a posting habit yet, so this solves the wrong problem first
- **Automatic TikTok page scraping for style analysis** — dropped due to TikTok ToS and API limitations; replaced with a user-driven style inspiration board
- **Standalone hook generator** — absorbed into the AI creative assistant as a prompt type rather than its own feature

## What's next

See [ROADMAP.md](./ROADMAP.md) for the full list. Short version: I'm currently dogfooding v1 and running user interviews with other creators to pressure-test the assumptions I made in the PRD. The next build priority is an AI script generation feature — but I want real interview data before I commit to scope, not just my own intuition.

## What I've learned so far

See [LEARNINGS.md](./LEARNINGS.md) for ongoing notes from dogfooding and interviews. Honest about what the PRD got right, what it got wrong, and what I'd do differently.

## Tech stack

Next.js · Supabase · Tailwind CSS · Clerk (auth) · Vercel (hosting)

## Running locally

```bash
git clone https://github.com/eyum04/creator-os-repo.git
cd creator-os-repo
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev
```

You'll need Supabase and Clerk accounts to run locally. See `.env.example` for the required environment variables.

## About this project

CreatorOS is an independent product I'm building solo as part of transitioning into AI Product Management. I'm treating it like a real product: define the problem, ship a solution, measure whether it works, iterate. The repo is a record of that loop in public.
