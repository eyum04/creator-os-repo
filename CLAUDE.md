# CreatorOS — CLAUDE.md

## What this project is
CreatorOS is a SaaS app for aspiring TikTok creators. It helps users capture video ideas, organize them across content pillars, build shot lists, manage a posting calendar, and use AI to generate scripts, hooks, and shot lists. Target user is someone just starting their TikTok journey who wants to be intentional and consistent with their content.

## Tech stack
- Framework: Next.js 14 with App Router
- Database: Supabase with Row Level Security on every table
- Auth: Clerk
- Payments: Stripe
- Styling: Tailwind CSS
- Animations: Framer Motion
- AI: Anthropic API using claude-sonnet-4-20250514

## Design system
- Background: #FFFFFF (clean white)
- Surface cards: #F8F9FA (off white, barely there)
- Primary accent: #2563EB (bold electric blue)
- Accent hover: #1D4ED8 (slightly deeper blue)
- Text primary: #0F172A (near black, warm)
- Text secondary: #64748B (slate gray)
- Borders: #E2E8F0 (very light gray)
- Error: #EF4444
- Success: #10B981
- Feel: Clean, modern, bold. Think Stripe meets a creator tool.
- Font: Inter for everything — clean, modern, highly legible
- Onboarding animations: staggered fade + slide-up using Framer Motion

## Monetization tiers
Free tier:
- Up to 10 pipeline ideas
- Up to 3 content pillars
- Manual shot list and calendar only

Pro tier ($9/month via Stripe):
- Unlimited ideas and pillars
- AI script and shot list generation
- AI creative assistant with style inspiration board
- Posting reminders
- Pillar analytics

Free tier limits must be enforced at the database level, not just the UI.

## Core features
1. Onboarding flow — 5 steps with Framer Motion staggered animations
2. Content pillar setup — unlimited pillars, 3 recommended
3. Capture-to-post pipeline — kanban with 4 stages: Idea, Scripted, Filmed, Posted
4. Shot list builder — manual and AI-generated (Pro)
5. Content calendar — monthly view, color coded by pillar
6. AI creative assistant — Pro only, context-aware chat with style inspiration board

## Database tables
- users (id, email, name, plan_tier, stripe_customer_id)
- pillars (id, user_id, name, color, created_at)
- ideas (id, user_id, pillar_id, title, stage, script, scheduled_date, created_at)
- shots (id, idea_id, content, order)
- style_inspirations (id, user_id, creator_name, style_summary, active)
- messages (id, user_id, role, content, created_at)

## AI assistant context
Every message to the Anthropic API must include in the system prompt:
- The user's active content pillars
- Their current pipeline ideas and stages
- Their saved and active style inspirations

## Build order
Always build in this sequence if starting fresh:
1. Project scaffold and database schema
2. Onboarding flow
3. Pillar setup
4. Pipeline
5. Shot list builder
6. Calendar
7. AI creative assistant

## Code conventions
- Use server components by default, client components only when needed
- All Supabase queries go through /lib/supabase
- All Anthropic API calls go through /lib/ai
- All Stripe logic goes through /lib/stripe
- Keep components small and single-purpose
- Use TypeScript throughout

## Current status
Building version 1 — free tier features only. No AI or Pro features in this build.
Feature order: scaffold (completed), onboarding (completed), landing page (completed), pillars (completed), pipeline (completed), shot list builder (completed), calendar (completed).
Dashboard moved to /dashboard route. Public landing page at /. Sign-in/sign-up pages at /sign-in and /sign-up.
App shell layout with sidebar at /dashboard/layout.tsx. Shared components in /src/components/. Types in /src/lib/types.ts.
All free-tier core features are complete. Next: Pro features, Anthropic API integration, Stripe payments (version 2).

## Important notes
- Never build features out of the build order without flagging it
- Always enforce free tier limits at the database level
- Row Level Security must be enabled on every Supabase table
- The PRD document is the source of truth for feature decisions
- Update the Current Status section above after each build session
