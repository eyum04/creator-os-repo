import { TROPHY_CONFIG, type TrophyLevel } from './types'

export interface TrophyResult {
  level: TrophyLevel | null
  streakWeeks: number
  postsThisWeek: number
}

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function getCurrentWeekKey(): string {
  return getISOWeekKey(new Date())
}

function getPreviousWeekKey(weeksAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - weeksAgo * 7)
  return getISOWeekKey(d)
}

export function computeTrophy(ideas: { posted_at: string | null }[]): TrophyResult {
  const posted = ideas.filter(i => i.posted_at)
  const currentWeekKey = getCurrentWeekKey()

  const postsByWeek = new Map<string, number>()
  for (const idea of posted) {
    const key = getISOWeekKey(new Date(idea.posted_at!))
    postsByWeek.set(key, (postsByWeek.get(key) ?? 0) + 1)
  }

  const postsThisWeek = postsByWeek.get(currentWeekKey) ?? 0

  // Walk backwards through complete weeks (skip current week — it's in progress)
  let streakWeeks = 0
  let weeksAgo = 1
  const tiers: TrophyLevel[] = ['Legend', 'Gold', 'Silver', 'Bronze']

  // Determine the highest tier we could possibly still be qualifying for
  // by finding the minimum posts/week needed for the current streak
  let minPerWeek = 0

  while (true) {
    const key = getPreviousWeekKey(weeksAgo)
    const count = postsByWeek.get(key) ?? 0
    if (count === 0) break
    if (streakWeeks === 0) minPerWeek = count
    else minPerWeek = Math.min(minPerWeek, count)
    streakWeeks++
    weeksAgo++
  }

  if (streakWeeks === 0) {
    return { level: null, streakWeeks: 0, postsThisWeek }
  }

  let level: TrophyLevel | null = null
  for (const tier of tiers) {
    const cfg = TROPHY_CONFIG[tier]
    if (minPerWeek >= cfg.minPostsPerWeek && streakWeeks >= cfg.streakWeeksRequired) {
      level = tier
      break
    }
  }

  return { level, streakWeeks, postsThisWeek }
}
